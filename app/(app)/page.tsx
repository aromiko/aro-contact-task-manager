import { redirect } from "next/navigation";

const Home = () => {
  redirect("/tasks");
};

export default Home;
