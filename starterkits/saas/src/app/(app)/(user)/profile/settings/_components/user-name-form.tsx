"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "next-auth";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui/icons";
import { useMutation } from "@tanstack/react-query";
import { updateName } from "@/server/actions/user";

const userNameFormSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long"),
});

export type UserNameFormSchema = z.infer<typeof userNameFormSchema>;

interface UserNameFormProps {
    user: User;
}

export function UserNameForm({ user }: UserNameFormProps) {
    const router = useRouter();

    const form = useForm<UserNameFormSchema>({
        resolver: zodResolver(userNameFormSchema),
        defaultValues: {
            name: user.name ?? "",
        },
    });

    const { isLoading, mutateAsync } = useMutation({
        mutationFn: () => updateName({ name: form.getValues().name }),
        onSuccess: () => {
            router.refresh();
            toast.success("Name updated successfully");
        },
        onError: (error: { message?: string } = {}) =>
            toast.error(
                error.message ?? "Failed to update name, please try again later",
            ),
    });

    const onSubmit = async (values: UserNameFormSchema) => {
        if (values.name === user.name) {
            return toast("Name is already set to this name");
        }

        await mutateAsync();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Your Name</CardTitle>
                        <CardDescription>
                            Please enter your full name, or a display name you
                            are comfortable with.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            placeholder="alidotm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button
                            disabled={isLoading}
                            type="submit"
                            className="gap-2"
                        >
                            {isLoading && <Icons.loader className="h-4 w-4" />}
                            <span>Save Changes</span>
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}