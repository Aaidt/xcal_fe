import GetRoomId from "@/components/ui/GetRoomId"

type CanvasPageProps = Promise<{ slug: string }>

export default async function Canvas({ params }: { params: CanvasPageProps }) {
  const { slug } = await params;

  return <GetRoomId slug={slug} />
}   
