interface color{
    color : string,
    size : string
}
export default function SendIcon(props : color){
    return <svg width={props.size} height={props.size} viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M22.1525 3.55321L11.1772 21.0044L9.50686 12.4078L2.00002 7.89795L22.1525 3.55321Z" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M9.45557 12.4436L22.1524 3.55321" stroke={props.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
}