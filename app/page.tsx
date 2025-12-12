 import HeaderBlock from "./components/header";
import NavigationBlock from "./components/navigation";
import WarnungenBlock from "./components/warnungen"; 
import FooterBlock from "./components/footer"; 
import ArticlesBlock from "./components/articles";

export default function Home() {
  return (
    <div className="flex bg-zinc-50 font-sans dark:bg-black flex-col items-center justify-center w-full p-4 md:p-3">
      <HeaderBlock /> 
      <NavigationBlock />
      <WarnungenBlock />
      <ArticlesBlock /> 
      <FooterBlock />
    </div>
  );
}
