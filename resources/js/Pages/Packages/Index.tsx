import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Package } from '@/types/package';
import { Head, Link } from '@inertiajs/react';

interface Props extends PageProps {
    packages: Package[];
}

export default function Index({ auth, packages }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Pakiety
                </h2>
            }
        >
            <Head title="Pakiety" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Lista Pakietów
                                </h3>
                                <Link
                                    href={route('packages.create')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
                                >
                                    Dodaj Pakiet
                                </Link>
                            </div>

                            {packages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Brak pakietów. Dodaj pierwszy pakiet klikając przycisk "Dodaj Pakiet".</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    ID Pakietu
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Typ
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Wykorzystanie
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Utworzono przez
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Data utworzenia
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Akcje
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {packages.map((pkg) => (
                                                <tr
                                                    key={pkg.id}
                                                    className={pkg.is_fully_used ? 'bg-gray-200' : 'hover:bg-gray-50'}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {pkg.custom_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        Pakiet {pkg.package_type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                                <div
                                                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                                                        pkg.is_fully_used ? 'bg-green-600' : 'bg-blue-600'
                                                                    }`}
                                                                    style={{ width: `${pkg.usage_percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-medium">
                                                                {pkg.usage_percentage}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {pkg.created_by}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {pkg.created_at}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            href={route('packages.show', pkg.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Szczegóły
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
