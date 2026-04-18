/**
 * Tambo tool definitions that expose the Avnac design canvas to the agent.
 *
 * All tools are built lazily from a `MutableRefObject<AiDesignController | null>`
 * so they survive panel remounts and always talk to the live canvas.
 */
import { z } from 'zod'
import type { MutableRefObject } from 'react'
import type { TamboTool } from '@tambo-ai/react'
import type { AiDesignController } from './avnac-ai-controller'

const placementSchema = z
  .object({
    x: z.number().describe('X in artboard pixels.').optional(),
    y: z.number().describe('Y in artboard pixels.').optional(),
    origin: z
      .enum(['top-left', 'center'])
      .describe(
        'Whether x/y refers to the object\'s top-left corner (default) or geometric center.',
      )
      .optional(),
  })
  .describe('Placement of the object on the artboard.')

const colorSchema = z
  .string()
  .describe(
    'CSS color in hex (#rrggbb / #rrggbbaa), rgb(), rgba(), hsl(), or a named color.',
  )

const okResultSchema = z.object({
  ok: z.boolean(),
  id: z.string().nullable(),
  note: z.string().optional(),
})

const countResultSchema = z.object({
  ok: z.boolean(),
  count: z.number(),
})

type OkResult = z.infer<typeof okResultSchema>

const fail = (note: string): OkResult => ({ ok: false, id: null, note })

export function buildAvnacTamboTools(
  controllerRef: MutableRefObject<AiDesignController | null>,
): TamboTool[] {
  const withCtl = <T, F>(
    fn: (ctl: AiDesignController) => T,
    fallback: F,
  ): T | F => {
    const ctl = controllerRef.current
    if (!ctl) return fallback
    return fn(ctl)
  }

  const describeCanvas: TamboTool = {
    name: 'describe_canvas',
    description:
      'Return the current artboard dimensions, background, and a summary of every object on the canvas. Use this to orient yourself before making edits or to answer questions about the current design.',
    tool: async () => {
      return withCtl(
        (ctl) => {
          const info = ctl.getCanvas()
          if (!info)
            return { ok: false as const, note: 'Canvas not ready.', canvas: null }
          return { ok: true as const, canvas: info }
        },
        { ok: false as const, note: 'Canvas not ready.', canvas: null },
      )
    },
    inputSchema: z.object({}).describe('No arguments.'),
    outputSchema: z.object({
      ok: z.boolean(),
      note: z.string().optional(),
      canvas: z
        .object({
          width: z.number(),
          height: z.number(),
          background: z.string().nullable(),
          objectCount: z.number(),
          objects: z.array(
            z.object({
              id: z.string(),
              kind: z.string(),
              label: z.string(),
              left: z.number(),
              top: z.number(),
              width: z.number(),
              height: z.number(),
              angle: z.number(),
              fill: z.string().nullable(),
              stroke: z.string().nullable(),
              text: z.string().nullable(),
            }),
          ),
        })
        .nullable(),
    }),
  }

  const addRectangle: TamboTool = {
    name: 'add_rectangle',
    description:
      'Add a rectangle to the artboard. Good for backgrounds, cards, buttons, input fields, and containers.',
    tool: async (args: {
      width: number
      height: number
      x?: number
      y?: number
      origin?: 'top-left' | 'center'
      fill?: string
      stroke?: string
      strokeWidth?: number
      cornerRadius?: number
      rotation?: number
      opacity?: number
    }): Promise<OkResult> => {
      return withCtl((ctl) => {
        const r = ctl.addRectangle(args)
        return r ? { ok: true, id: r.id } : fail('Canvas not ready.')
      }, fail('Canvas not ready.'))
    },
    inputSchema: placementSchema.extend({
      width: z.number().positive(),
      height: z.number().positive(),
      fill: colorSchema.optional(),
      stroke: colorSchema.optional(),
      strokeWidth: z.number().min(0).optional(),
      cornerRadius: z.number().min(0).optional(),
      rotation: z.number().describe('Rotation in degrees.').optional(),
      opacity: z.number().min(0).max(1).optional(),
    }),
    outputSchema: okResultSchema,
  }

  const addEllipse: TamboTool = {
    name: 'add_ellipse',
    description:
      'Add an ellipse (or circle, when width = height) to the artboard. Good for avatars, badges, icons, and accents.',
    tool: async (args: {
      width: number
      height: number
      x?: number
      y?: number
      origin?: 'top-left' | 'center'
      fill?: string
      stroke?: string
      strokeWidth?: number
      rotation?: number
      opacity?: number
    }): Promise<OkResult> => {
      return withCtl((ctl) => {
        const r = ctl.addEllipse(args)
        return r ? { ok: true, id: r.id } : fail('Canvas not ready.')
      }, fail('Canvas not ready.'))
    },
    inputSchema: placementSchema.extend({
      width: z.number().positive(),
      height: z.number().positive(),
      fill: colorSchema.optional(),
      stroke: colorSchema.optional(),
      strokeWidth: z.number().min(0).optional(),
      rotation: z.number().optional(),
      opacity: z.number().min(0).max(1).optional(),
    }),
    outputSchema: okResultSchema,
  }

  const addText: TamboTool = {
    name: 'add_text',
    description:
      'Add a text layer to the artboard. Use this for headings, body copy, labels, and captions. Remember to choose a font size that fits the artboard dimensions.',
    tool: async (args: {
      text: string
      x?: number
      y?: number
      origin?: 'top-left' | 'center'
      fontSize?: number
      fontFamily?: string
      fontWeight?: number | 'normal' | 'bold'
      fontStyle?: 'normal' | 'italic'
      fill?: string
      textAlign?: 'left' | 'center' | 'right' | 'justify'
      width?: number
      rotation?: number
      opacity?: number
    }): Promise<OkResult> => {
      return withCtl((ctl) => {
        const r = ctl.addText(args)
        return r ? { ok: true, id: r.id } : fail('Canvas not ready.')
      }, fail('Canvas not ready.'))
    },
    inputSchema: placementSchema.extend({
      text: z.string(),
      fontSize: z.number().positive().optional(),
      fontFamily: z.string().optional(),
      fontWeight: z
        .union([z.number(), z.literal('normal'), z.literal('bold')])
        .optional(),
      fontStyle: z.enum(['normal', 'italic']).optional(),
      fill: colorSchema.optional(),
      textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
      width: z
        .number()
        .positive()
        .describe('Textbox width; text wraps inside this width.')
        .optional(),
      rotation: z.number().optional(),
      opacity: z.number().min(0).max(1).optional(),
    }),
    outputSchema: okResultSchema,
  }

  const addLine: TamboTool = {
    name: 'add_line',
    description:
      'Add a straight line between two points. Useful for dividers, strokes, and connectors.',
    tool: async (args: {
      x1: number
      y1: number
      x2: number
      y2: number
      stroke?: string
      strokeWidth?: number
      opacity?: number
    }): Promise<OkResult> => {
      return withCtl((ctl) => {
        const r = ctl.addLine(args)
        return r ? { ok: true, id: r.id } : fail('Canvas not ready.')
      }, fail('Canvas not ready.'))
    },
    inputSchema: z.object({
      x1: z.number(),
      y1: z.number(),
      x2: z.number(),
      y2: z.number(),
      stroke: colorSchema.optional(),
      strokeWidth: z.number().min(0).optional(),
      opacity: z.number().min(0).max(1).optional(),
    }),
    outputSchema: okResultSchema,
  }

  const addImage: TamboTool = {
    name: 'add_image',
    description:
      'Place an image from a public HTTPS URL onto the artboard. Size defaults to the image\'s native dimensions; provide width/height to resize.',
    tool: async (args: {
      url: string
      x?: number
      y?: number
      origin?: 'top-left' | 'center'
      width?: number
      height?: number
      rotation?: number
      opacity?: number
    }): Promise<OkResult> => {
      const ctl = controllerRef.current
      if (!ctl) return fail('Canvas not ready.')
      const r = await ctl.addImageFromUrl(args)
      return r ? { ok: true, id: r.id } : fail('Failed to load image.')
    },
    inputSchema: placementSchema.extend({
      url: z.string().url(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      rotation: z.number().optional(),
      opacity: z.number().min(0).max(1).optional(),
    }),
    outputSchema: okResultSchema,
  }

  const updateObject: TamboTool = {
    name: 'update_object',
    description:
      'Mutate an existing object by its id (returned from add_* tools or describe_canvas). Only provide fields you want to change.',
    tool: async (args: {
      id: string
      left?: number
      top?: number
      width?: number
      height?: number
      scaleX?: number
      scaleY?: number
      angle?: number
      fill?: string
      stroke?: string
      strokeWidth?: number
      opacity?: number
      text?: string
      fontSize?: number
    }): Promise<OkResult> => {
      return withCtl((ctl) => {
        const { id, ...patch } = args
        const ok = ctl.updateObject(id, patch)
        return ok
          ? { ok: true, id }
          : { ok: false, id, note: 'Object not found.' }
      }, fail('Canvas not ready.'))
    },
    inputSchema: z.object({
      id: z.string(),
      left: z.number().optional(),
      top: z.number().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      scaleX: z.number().positive().optional(),
      scaleY: z.number().positive().optional(),
      angle: z.number().optional(),
      fill: colorSchema.optional(),
      stroke: colorSchema.optional(),
      strokeWidth: z.number().min(0).optional(),
      opacity: z.number().min(0).max(1).optional(),
      text: z.string().optional(),
      fontSize: z.number().positive().optional(),
    }),
    outputSchema: okResultSchema,
  }

  const deleteObject: TamboTool = {
    name: 'delete_object',
    description: 'Remove an object from the canvas by its id.',
    tool: async (args: { id: string }): Promise<OkResult> => {
      return withCtl((ctl) => {
        const ok = ctl.deleteObject(args.id)
        return ok
          ? { ok: true, id: args.id }
          : { ok: false, id: args.id, note: 'Object not found.' }
      }, fail('Canvas not ready.'))
    },
    inputSchema: z.object({ id: z.string() }),
    outputSchema: okResultSchema,
  }

  const setBackground: TamboTool = {
    name: 'set_background',
    description: 'Set the artboard background to a solid color.',
    tool: async (args: { color: string }) => {
      return withCtl(
        (ctl) => {
          ctl.setBackgroundColor(args.color)
          return { ok: true as const }
        },
        { ok: false as const },
      )
    },
    inputSchema: z.object({ color: colorSchema }),
    outputSchema: z.object({ ok: z.boolean() }),
  }

  const clearCanvas: TamboTool = {
    name: 'clear_canvas',
    description:
      'Remove every object from the artboard. Use sparingly and confirm the intent in your message before calling.',
    tool: async () => {
      return withCtl(
        (ctl) => ({ ok: true as const, count: ctl.clearCanvas() }),
        { ok: false as const, count: 0 },
      )
    },
    inputSchema: z.object({}),
    outputSchema: countResultSchema,
  }

  const selectObjects: TamboTool = {
    name: 'select_objects',
    description:
      'Select one or more objects by id so the user can see them highlighted after the agent\'s edits.',
    tool: async (args: { ids: string[] }) => {
      return withCtl(
        (ctl) => ({ ok: true as const, count: ctl.selectObjects(args.ids) }),
        { ok: false as const, count: 0 },
      )
    },
    inputSchema: z.object({ ids: z.array(z.string()) }),
    outputSchema: countResultSchema,
  }

  return [
    describeCanvas,
    addRectangle,
    addEllipse,
    addText,
    addLine,
    addImage,
    updateObject,
    deleteObject,
    setBackground,
    clearCanvas,
    selectObjects,
  ]
}
