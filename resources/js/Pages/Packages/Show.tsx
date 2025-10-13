import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { PackageWithUsages, PackageServiceUsage } from '@/types/package';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props extends PageProps {
    package: PackageWithUsages;
}

export default function Show({ auth, package: pkg }: Props) {
    const handleToggleUsage = (usageId: number) => {
        router.post(
            route('package-usage.toggle', usageId),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const renderServiceList = (services: PackageServiceUsage[], title: string, icon: string) => {
        if (!services || services.length === 0) {
            return null;
        }

        return (
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">{icon}</span>
                    {title}
                </h3>
                <div className="space-y-3">
                    {services.map((usage) => (
                        <div
                            key={usage.id}
                            className={`p-3 rounded-lg border ${
                                usage.is_used
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-white border-gray-200'
                            }`}
                        >
                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={usage.is_used}
                                    onChange={() => handleToggleUsage(usage.id)}
                                    className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="ml-3 flex-1">
                                    <div className="font-medium text-gray-900">
                                        {usage.service_name}
                                    </div>
                                    {usage.service_description && (
                                        <div className="text-sm text-gray-500 mt-1">
                                            {usage.service_description}
                                        </div>
                                    )}
                                    {usage.service_duration && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            Czas trwania: {usage.service_duration} min
                                        </div>
                                    )}
                                    {usage.is_used && (
                                        <div className="text-xs text-green-600 mt-2">
                                            ✓ Wykorzystano: {usage.used_at}
                                            {usage.marked_by && ` przez ${usage.marked_by}`}
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Pakiet: {pkg.custom_id}
                    </h2>
                    <Link
                        href={route('packages.index')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Powrót do listy
                    </Link>
                </div>
            }
        >
            <Head title={`Pakiet ${pkg.custom_id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Package Info Card */}
                    <div className={`overflow-hidden shadow-sm sm:rounded-lg mb-6 ${
                        pkg.is_fully_used ? 'bg-gray-300' : 'bg-white'
                    }`}>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">ID Pakietu</div>
                                    <div className="text-lg font-semibold text-gray-900">{pkg.custom_id}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Typ pakietu</div>
                                    <div className="text-lg font-semibold text-gray-900">Pakiet {pkg.package_type}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Utworzono przez</div>
                                    <div className="text-lg font-semibold text-gray-900">{pkg.created_by}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Data utworzenia</div>
                                    <div className="text-lg font-semibold text-gray-900">{pkg.created_at}</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Wykorzystanie pakietu
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {pkg.usage_percentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className={`h-4 rounded-full ${
                                            pkg.is_fully_used ? 'bg-green-600' : 'bg-blue-600'
                                        }`}
                                        style={{ width: `${pkg.usage_percentage}%` }}
                                    ></div>
                                </div>
                                {pkg.is_fully_used && (
                                    <div className="mt-2 text-center text-sm font-semibold text-green-600">
                                        ✓ Pakiet w pełni wykorzystany
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Services in 3 Columns */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Usługi w pakiecie</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {renderServiceList(
                                    pkg.usages_by_zone.relaksu,
                                    'Strefa Relaksu',
                                    '🧘'
                                )}
                                {renderServiceList(
                                    pkg.usages_by_zone.odnowy,
                                    'Strefa Odnowy',
                                    '💆'
                                )}
                                {renderServiceList(
                                    pkg.usages_by_zone.smaku,
                                    'Strefa Smaku',
                                    '🍽️'
                                )}
                            </div>

                            {pkg.usages_by_zone.relaksu.length === 0 &&
                                pkg.usages_by_zone.odnowy.length === 0 &&
                                pkg.usages_by_zone.smaku.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>Brak usług w tym pakiecie.</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
