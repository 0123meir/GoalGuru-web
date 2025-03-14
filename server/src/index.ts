import dotenv from "dotenv";
import myApp from "./app";

dotenv.config();

const port = process.env.PORT;
myApp.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
