import NextError from "next/error";
import { trpc } from "@/utils/trpc";
import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";

export default function handler() {
  // const id = useRouter;

  // const query = trpc.position.byId.useQuery({
  //   id: parseInt(id, 10),
  // });

  // if (query.error) {
  //   return (
  //     <NextError
  //       title={query.error.message}
  //       statusCode={query.error.data?.httpStatus ?? 500}
  //     />
  //   );
  // }

  // if (query.status !== 'success') {
  //   return <>Loading...</>;
  // }
  // const { data } = query;
  // return (<div>{data?.title}</div>);
}
