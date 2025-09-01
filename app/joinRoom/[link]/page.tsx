import GetRoomId from '@/components/ui/GetRoomId';

type JoinParams = Promise<{ link: string }>

export default async function Join(
  { params }: { params: JoinParams }) {
  const { link } = await params;

  return <GetRoomId Roomlink={link} />

}
