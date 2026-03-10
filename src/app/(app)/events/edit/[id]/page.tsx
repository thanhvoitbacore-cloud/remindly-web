import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import EditEventClientForm from "./EditEventClientForm";

export default async function EditEventPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const eventId = params.id;
    const event = await prisma.event.findFirst({
        where: { id: eventId, ownerId: session.user.id }
    });

    if (!event) notFound();

    // Định dạng lại Date/Time đẩy vào input default
    const formattedDate = format(event.startTime, "yyyy-MM-dd");
    const formattedStartTime = format(event.startTime, "HH:mm");
    const formattedEndTime = format(event.endTime, "HH:mm");

    const initialData = {
        title: event.title,
        description: event.description || "",
        date: formattedDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        priority: event.priority,
        categoryTag: event.categoryTag || "General",
        isDraft: event.isDraft
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
            <header className="flex items-center justify-between pb-4 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        {event.isDraft ? "Resume Editing Draft" : "Sửa Sự kiện"}
                    </h1>
                    <p className="text-gray-400">
                        {event.isDraft
                            ? "Complete your draft to move it to the official calendar."
                            : "Update existing event settings and details."
                        }
                    </p>
                </div>
            </header>

            <EditEventClientForm eventId={event.id} initialData={initialData} />
        </div>
    );
}
