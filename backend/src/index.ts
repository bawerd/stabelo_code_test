import cors from "kcors";
import Koa from "koa";
import bodyparser from "koa-bodyparser";
import Router from "koa-router";
import websocket from "koa-websocket";
import { ElevatorDispatch } from "./elevator-system";

const app = websocket(new Koa());
const router = new Router();


app.use(bodyparser({
    enableTypes: ["json"],
}));
app.use(cors());


// This is just an example route
router.get("/sample", (context) => {
    context.response.body = { message: "Hello world" };
    context.response.status = 200;
});

// Add additional routes for implementation here...
const elevatorDispatch = ElevatorDispatch.instance();

app.ws.use(async (ctx, next) => {
    ctx.websocket.on('message', (message) => {
        elevatorDispatch.dispatch(JSON.parse(message.toString()));
    });


    elevatorDispatch.init(ctx.websocket);

    await next();
});

app.use(router.routes());

app.listen(3000);
