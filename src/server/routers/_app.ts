import { procedure, router } from "../trpc";
import { positionRouter } from "./position";
import { employeeRouter } from "./employee";

export const appRouter = router({
  health: procedure.query(function () {
    return "Hello World!";
  }),
});

export type AppRouter = typeof appRouter;
