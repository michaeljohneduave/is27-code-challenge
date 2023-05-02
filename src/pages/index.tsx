import Image from "next/image";
import { Inter } from "next/font/google";
import { trpc } from "@/utils/trpc";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";
import ReactNiceAvatar from "react-nice-avatar";
import { ReactElement } from "react";

const inter = Inter({ subsets: ["latin"] });

type Positions = inferProcedureOutput<AppRouter["position"]["list"]>;
type Position = inferProcedureOutput<AppRouter["position"]["byId"]>;

function position(position: Position) {
  let avatar: ReactElement;
  let name: string;

  if (position?.employee?.avatar) {
    avatar = (
      <ReactNiceAvatar
        className="h-32 w-32 rounded-full"
        {...JSON.parse(position.employee.avatar)}
      />
    );
    name = position.employee.name;
  } else {
    avatar = <img className="h-32 w-32 rounded-full" src="blank.jpg" alt="" />;
    name = "Vacant McVacancy";
  }

  return (
    <div className="flex flex-col items-center gap-x-6">
      {avatar}
      <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">
        {name}
      </h3>
      <p className="text-sm font-semibold leading-6 text-indigo-600">
        {position?.title}
      </p>
    </div>
  );
}

function group(title: string) {
  const { data: positions } = trpc.position.list.useQuery({
    title,
    limit: 100,
    page: 1,
  });

  return (
    <div className="flex flex-wrap flex-row justify-center py-10 hover:bg-slate-50 rounded-xl">
      {positions?.map((p) => {
        return (
          <div className="p-10 hover:scale-125 hover:cursor-pointer">
            {position(p)}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const { data: titles } = trpc.position.types.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <main className={`min-h-screen p-24 ${inter.className}`}>
      <div className="bg-white flex flex-wrap flex-col items-center p-5">
        <div className="p-10 text-4xl font-bold">Team Directory</div>
        {titles?.map(({ title }) => group(title))}
      </div>
    </main>
  );
}
