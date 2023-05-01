import { procedure, router } from "../trpc";
import { positionRouter } from "./position";
import { employeeRouter } from "./employee";
import { tenureRouter } from "./tenure";

export const appRouter = router({
  health: procedure.query(function () {
    return "Hello World!";
  }),

  position: positionRouter,
  employee: employeeRouter,
  tenure: tenureRouter,
});

export type AppRouter = typeof appRouter;
