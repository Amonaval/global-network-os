import {DEFAULT_CATALOG} from "../../lib/i18n/catalog";
import PublicPage from "../../components/PublicPage";

export const metadata = {
  title: DEFAULT_CATALOG.PublicDirectory2Txt,
  description: DEFAULT_CATALOG.PublicMemberDirectoryForThisHierarchyNetworkTxt,
};

export default function PublicRoute() {
  return <PublicPage />;
}
