import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import UpdateTrafficForm from './Home/Partials/UpdateTrafficForm';
import UpdateAlertForm from "@/Pages/Home/Partials/UpdateAlertForm";

export default function Dashboard({
                                      traffic,
                                      alertType,
                                      alertMessage,
                                      alertEnabled,
                                  }: {
    traffic: number | null;
    alertType: string,
    alertMessage: string;
    alertEnabled: boolean
}) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard"/>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 grid xl:grid-cols-2 gap-6">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateTrafficForm value={traffic?.toString() ?? '50'}/>
                    </div>
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateAlertForm alertType={alertType} alertMessage={alertMessage} alertEnabled={alertEnabled}/>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
