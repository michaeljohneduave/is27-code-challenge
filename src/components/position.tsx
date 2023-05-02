import { ReactElement, useState } from "react";
import Image from "next/image";
import {
  FaCheck,
  FaEdit,
  FaMinusCircle,
  FaMinusSquare,
  FaTrash,
  FaWindowClose,
} from "react-icons/fa";
import ReactNiceAvatar from "react-nice-avatar";
import { Prisma } from "@prisma/client";

import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";

import blankAvatar from "../../public/blank.jpg";
import { trpc } from "@/utils/trpc";

type Position = inferProcedureOutput<AppRouter["position"]["byId"]>;

type NameProps = {
  name: string | undefined;
  editing: boolean;
  save: (name: string | undefined) => void;
};

type TitleProps = {
  title: string;
  save: (title: string | undefined) => void;
};

function RenderName({ name, editing, save }: NameProps): ReactElement {
  let [text, setText] = useState(name);

  const onSave = () => {
    save(text);
  };

  if (editing) {
    return (
      <div className="flex flex-row items-center m-2">
        <input
          id="name"
          name="name"
          defaultValue={name}
          onChange={(e) => {
            setText(e.currentTarget.value);
          }}
          className="py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 "
        />
        <FaCheck className="ml-2 hover:cursor-pointer" onClick={onSave} />
      </div>
    );
  }

  return (
    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">
      {name}
    </h3>
  );
}

function RenderTitle({ title, save }: TitleProps): ReactElement {
  const [text, setText] = useState("");

  if (title !== "No Role") {
    return (
      <div>
        <p className="text-sm font-semibold leading-6 text-indigo-600">
          {title}
        </p>
      </div>
    );
  }
  const { data: types } = trpc.position.types.useQuery({ isNoRole: true });

  const onSave = () => {
    if (text !== "No Role") {
      save(text);
    }
  };

  return (
    <div className="flex flex-row">
      <select
        onChange={(e) => {
          setText(e.currentTarget.value);
        }}
      >
        <option key={"No Role"}>No Role</option>
        {types?.map(({ title }) => {
          return <option key={title}>{title}</option>;
        })}
      </select>
      <FaCheck
        className="ml-2 invisible hover:cursor-pointer hover:scale-125 group-hover/item:visible"
        onClick={onSave}
      />
    </div>
  );
}

export default function Position(position: Position) {
  const utils = trpc.useContext();
  const [editing, setEditing] = useState(false);
  const saveEmployee = trpc.employee.update.useMutation({
    onMutate() {
      setEditing(false);
    },
    onSettled() {
      utils.position.list.refetch();
    },
  });
  const fillPosition = trpc.position.fill.useMutation({
    onSettled() {
      utils.position.list.refetch();
    },
  });
  const vacatePosition = trpc.position.vacate.useMutation({
    onSettled() {
      utils.position.types.refetch();
      utils.position.list.refetch();
    },
  });

  let avatar: ReactElement;
  let name: string;
  let type: string;

  if (position?.employee?.avatar) {
    avatar = (
      <ReactNiceAvatar
        className="h-32 w-32 rounded-full"
        {...(position.employee.avatar as Prisma.JsonObject)}
      />
    );
    name = position.employee.name;
    type = "filled";
  } else {
    avatar = (
      <div className="h-32 w-32 rounded-full">
        <Image src={blankAvatar} alt="" />
      </div>
    );
    name = "Vacant McVacancy";
    type = "vacant";
  }

  const handleEditing = () => {
    setEditing(true);
  };

  const closeEditing = () => {
    setEditing(false);
  };

  const handleNameSave = (name: string | undefined) => {
    if (name) {
      saveEmployee.mutate({
        id: position?.employeeId as number,
        name,
      });
    }
  };

  const handleTitleSave = (title: string | undefined) => {
    if (title) {
      fillPosition.mutate({
        employeeId: position?.employeeId as number,
        title: title,
      });
    }
  };

  const handleRemove = () => {
    if (position?.title !== "No Role" && position?.title !== "Director") {
      vacatePosition.mutate({
        id: position?.id as number,
        employeeId: position?.employeeId as number,
      });
    }
  };

  const EditName = () => {
    return (
      <>
        {editing ? (
          <FaWindowClose
            className="hover:cursor-pointer hover:scale-125"
            onClick={closeEditing}
          />
        ) : (
          <FaEdit
            className="hover:cursor-pointer hover:scale-125"
            onClick={handleEditing}
          />
        )}
      </>
    );
  };

  return (
    <div className="min-w-fit flex flex-col items-center gap-x-6">
      <div className="ml-auto invisible group-hover/item:visible mt-2">
        {type === "filled" &&
        position?.title !== "No Role" &&
        position?.title !== "Director" ? (
          <FaWindowClose
            className="hover:cursor-pointer hover:scale-125"
            onClick={handleRemove}
          />
        ) : (
          <FaWindowClose className="invisible" />
        )}
      </div>
      {avatar}
      <div className="flex flex-row items-center">
        <RenderName name={name} editing={editing} save={handleNameSave} />
        <div className="px-1 invisible group-hover/item:visible">
          {type === "filled" ? (
            <EditName />
          ) : (
            <FaWindowClose className="invisible" />
          )}
        </div>
      </div>
      <RenderTitle title={position?.title as string} save={handleTitleSave} />
    </div>
  );
}
