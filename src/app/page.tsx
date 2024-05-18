//import FormReg from '@/components/form'
import Login from "@/components/login";
export default async function Home() {
  return (
    <main className="dark:bg-zinc-950e mx-auto flex min-h-screen flex-col items-center justify-center md:container dark:text-white">
      {/* <FormReg/> */}
      <Login />
    </main>
  );
}
