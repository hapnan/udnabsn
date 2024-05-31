import { getuserall } from "@/action/action";
import FormRegister from "@/components/formreg";

export default async function Register() {
  const user = await getuserall();

  return <FormRegister data={user} />;
}
