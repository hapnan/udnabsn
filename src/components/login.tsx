"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import PP from "@/app/asset/images.jpg";
import { Button } from "./ui/button";

export default function Login() {
  return (
    <div className="flex w-full flex-col items-center justify-center ">
      <Button variant="link" className="h-auto ">
        <Card className="w-[430px]">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-col justify-center gap-2">
              <CardTitle>Hapnan Arsad Riski</CardTitle>
              <CardDescription>A11.2017.10743</CardDescription>
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
      <Button variant="link" className="h-auto ">
        <Card className="w-[430px]">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-col justify-center gap-2">
              <CardTitle>Hapnan Arsad Riski</CardTitle>
              <CardDescription>A11.2017.10743</CardDescription>
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
      <Button variant="link" className="h-auto ">
        <Card className="w-[430px]">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-col justify-center gap-2">
              <CardTitle>Hapnan Arsad Riski</CardTitle>
              <CardDescription>A11.2017.10743</CardDescription>
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
      <Button variant="link" className="h-auto ">
        <Card className="w-[430px]">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-col justify-center gap-2">
              <CardTitle>Hapnan Arsad Riski</CardTitle>
              <CardDescription>A11.2017.10743</CardDescription>
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
    </div>
  );
}
