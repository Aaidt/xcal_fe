import GetRoomId from "@/components/ui/GetRoomId"

export default async function Canvas ({
    params
}: {
    params: { slug: string}
}) {    
    const { slug } = await params;

    return <GetRoomId slug={slug} />
}   