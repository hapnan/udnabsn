import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import PP from "@/app/asset/images.jpg";
import { Button } from "./ui/button";
import { getuserall } from "@/action/action";

export default async function Login() {
  const user = await getuserall();

  return (
    <div className="flex w-full flex-col items-center justify-center ">
      {user.map((usr) => (
        <Button key={usr.id} variant="link" className="h-auto ">
          <Card className="w-[430px]">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex flex-col justify-center gap-2">
                <CardTitle>{usr.name}</CardTitle>
                <CardDescription>{usr.nim}</CardDescription>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Image
                  src={PP}
                  className="aspect-square h-full w-full"
                  alt="Foto Profil"
                />
              </div>
            </CardHeader>
          </Card>
        </Button>
      ))}
    </div>
  );
}
