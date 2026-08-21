import PublicMemberPage from "../../../../components/PublicMemberPage";
export default function Page({params}:{params:{id:string}}){return <PublicMemberPage memberId={params.id}/>}
