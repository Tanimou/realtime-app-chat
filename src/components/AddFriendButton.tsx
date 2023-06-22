"use client";

import { FC, useState } from "react";
import Button from "./ui/Button";
import { addFriendValidator } from "@/lib/validations/add-friends";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

interface AddFriendButtonProps { }

type FormData = z.infer<typeof addFriendValidator>;

const AddFriendButton: FC<AddFriendButtonProps> = ({ }) => {
    // const [showSuccessState, setShowSuccessState] = useState<boolean>(false)
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(addFriendValidator) });

    const addFriend = async (email: string) => {
        try {
            const validatedEmail = addFriendValidator.parse({ email });
            await axios.post("/api/friends/add", { email: validatedEmail });
            // setShowSuccessState(true)
            toast.success("Friend request successfully sent!");
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError("email", { message: error.message });
                toast.error("Something went wrong. Please try again.");
                return;
            }
            if (error instanceof AxiosError) {
                setError("email", { message: error.response?.data });
                toast.error("Something went wrong. Please try again.");
                return;
            }
            setError("email", { message: "Something went wrong" });
            toast.error("Something went wrong. Please try again.");
        }
    };

    const onSubmit = (data: FormData) => {
        addFriend(data.email);
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
            <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
            >
                Add friends by their email
            </label>
            <div className="mt-2 flex gap-4">
                <input
                    {...register("email")}
                    type="text"
                    className="block w-full rounded-full border-0 py-1.5 text-gray-900 shadow-md ring-3 ring-inset ring-indigo-300 placeholder:text-gray-700 focus:ring-1 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder=" you@example.com"
                />
                <Button>Add</Button>
            </div>
            <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
            {/* {showSuccessState ?
    <p className="mt-1 text-sm text-green-600">Friend request successfully sent!</p>
        : null
        } */}
        </form>
    );
};

export default AddFriendButton;
