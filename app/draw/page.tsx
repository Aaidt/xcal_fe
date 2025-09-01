"use client"


import { Tldraw, toRichText } from "tldraw"
import "tldraw/tldraw.css"

export default function Draw() {
  const handleMount = (editor: any) => {
    editor.createShape({
      type: 'text',
      x: 200,
      y: 200,
      props: {
        richText: toRichText("Hello world")
      },
    })

    editor.selectAll()

    editor.zoomToSelection({
      animation: { duration: 5000 },
    })
  }

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw persistenceKey="pages" />
    </div>
  )
}
