import { Inter } from "next/font/google";
import { trpc } from "@/utils/trpc";
import Position from "@/components/position";
import { useState } from "react";
import {debounce, throttle} from "lodash"

const inter = Inter({ subsets: ["latin"] });

function group(title: string) {
  let t = title;
  const positions = trpc.position.list.useQuery(
    {
      title,
      limit: 100,
      page: 1,
    },
    {
      staleTime: 3000,
    }
  );

  if (positions.data && positions.data.length > 1) {
    t = title + "s";
  }

  const employees = positions?.data?.filter((p) => {
    return p.employeeId;
  });

  if (
    !positions?.data?.length ||
    (positions?.data?.length && title === "No Role" && !employees?.length)
  ) {
    return;
  }

  return (
    <div>
      {title === "No Role" ? (
        <div className="mt-10 font-bold text-center leading-9 text-2xl">
          {t}
        </div>
      ) : (
        ""
      )}
      <div className="flex flex-wrap flex-row justify-center py-10 ">
        {positions.data?.map((p) => {
          return (
            <div
              key={p.id}
              className="p-5 hover:scale-110 hover:bg-slate-50 rounded-xl group/item"
            >
              <Position {...p} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const utils = trpc.useContext();
  const [adding, setAdding] = useState(false);
  const { data: titles } = trpc.position.types.useQuery(
    { isNoRole: false },
    {
      refetchOnWindowFocus: false,
    }
  );
  const addEmployee = trpc.employee.create.useMutation({
    onSettled() {
      setAdding(false);
      utils.position.list.refetch();
      utils.position.types.refetch();
    },
  });
  let btnLabel = "Add Employees";

  if (adding) {
    btnLabel = "Adding Employees..";
  }

  const handleAdd = throttle(() => {
    if (!adding) {
      setAdding(true);
      addEmployee.mutate();
    }
  }, 1000, {
    trailing: true,
  });

  return (
    <main className={`min-h-screen p-24 ${inter.className}`}>
      <div className="bg-white flex flex-wrap flex-col items-center p-5">
        <div className="p-10 text-4xl font-bold">Team Directory</div>
        {titles?.map(({ title }) => group(title))}
        <div className="pt-20">
          <button
            className="text-base font-medium rounded-lg p-3 bg-sky-500 text-white"
            onClick={handleAdd}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </main>
  );
}
