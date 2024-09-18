import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axios from "axios";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { data } = await axios.post(
        "http://localhost:8000/api/users/register",
        formData,
        {
          withCredentials: true,
        }
      );
      if (data.success) {
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        className="shadow-lg flex flex-col gap-5 p-8"
        onSubmit={handleSubmit}
      >
        <div className="my-4">
          <h1 className="text-center font-bold text-xl">Logo</h1>
          <p className="text-sm text-center text-slate-600 font-medium">
            Signup to see Photos and Videos from your friends
          </p>
        </div>
        <div>
          <Label className="font-medium">Username</Label>
          <Input
            type="text"
            name="username"
            value={formData.username}
            className="focus-visible:ring-transparent mt-2"
            placeholder="Your Username"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label className="font-medium">Email</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            className="focus-visible:ring-transparent mt-2"
            placeholder="example@gmail.com"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label className="font-medium">Password</Label>
          <Input
            type="text"
            name="password"
            value={formData.password}
            className="focus-visible:ring-transparent mt-2"
            placeholder="Your Password"
            onChange={handleChange}
          />
        </div>

        <Button disabled={loading} type="submit">
          {loading ? "Loading..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
}

export default Signup;
