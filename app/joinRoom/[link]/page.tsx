import GetRoomId from '@/components/ui/GetRoomId';

export default async function Join(
    { params } : { params: { link: string }
}){
    const { link } = await params;

    return <GetRoomId Roomlink={link} />

}