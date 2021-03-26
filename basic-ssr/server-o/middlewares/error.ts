
export default async (ctx:any, next:any) => {
  console.log("middleware:error....");
  try {
    await next();
  } catch (error) {
    console.log("middleware:error",error);
    const { status, msg } = error;
    ctx.status = 500;
    ctx.body = {
      msg: "server error",
      error,
    };
    // if (error instanceof ServerError) {
    //   // the error of code
    //   ctx.status = status || 500;
    //   ctx.body = {
    //     msg,
    //   };
    // } else {
    //   // the error of server
    //   ctx.status = 500;
    //   ctx.body = {
    //     msg: "server error",
    //     error,
    //   };
    // }
  }
};
