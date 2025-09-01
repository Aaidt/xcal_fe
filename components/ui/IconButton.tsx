export default function IconButton({
    icon,
    onClick,
    activated
}: {
    icon: React.ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return <div className={`rounded-md px-3 py-3 duration-200 cursor-pointer text-white
        ${activated ? "bg-[#413e6b]" : "bg-[#232329] hover:bg-[#2e2c38]"}`} onClick={onClick}>
            {icon}
    </div>

}