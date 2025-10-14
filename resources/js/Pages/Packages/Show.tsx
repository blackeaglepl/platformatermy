import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { PackageWithUsages, PackageServiceUsage } from '@/types/package';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface Props extends PageProps {
    package: PackageWithUsages;
    flash?: {
        success?: string;
    };
}

export default function Show({ auth, package: pkg, flash }: Props) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingUsageId, setPendingUsageId] = useState<number | null>(null);
    const [pendingServiceName, setPendingServiceName] = useState<string>('');
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    const { data: notesData, setData: setNotesData, patch: patchNotes, processing: processingNotes } = useForm({
        notes: pkg.notes || '',
    });

    const handleToggleUsage = (usage: PackageServiceUsage) => {
        // Jeśli usługa jest już wykorzystana, pytamy o potwierdzenie
        if (usage.is_used) {
            setPendingUsageId(usage.id);
            setPendingServiceName(usage.service_name);
            setShowConfirmModal(true);
        } else {
            // Jeśli usługa nie jest wykorzystana, zaznaczamy bez pytania
            performToggle(usage.id);
        }
    };

    const performToggle = (usageId: number) => {
        router.post(
            route('package-usage.toggle', usageId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowConfirmModal(false);
                    setPendingUsageId(null);
                    setPendingServiceName('');
                }
            }
        );
    };

    const handleConfirmUnmark = () => {
        if (pendingUsageId) {
            performToggle(pendingUsageId);
        }
    };

    const handleCancelUnmark = () => {
        setShowConfirmModal(false);
        setPendingUsageId(null);
        setPendingServiceName('');
    };

    const handleSaveNotes = () => {
        patchNotes(route('packages.update-notes', pkg.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingNotes(false);
            }
        });
    };

    const handleCancelEditNotes = () => {
        setNotesData('notes', pkg.notes || '');
        setIsEditingNotes(false);
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
                                    onChange={() => handleToggleUsage(usage)}
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
                    {/* Success Message */}
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            <span className="block sm:inline">{flash.success}</span>
                        </div>
                    )}

                    {/* Single Unified Card */}
                    <div className={`overflow-hidden shadow-sm sm:rounded-lg ${
                        pkg.is_fully_used ? 'bg-gray-300' : 'bg-white'
                    }`}>
                        <div className="p-6">
                            {/* Package Header Info */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">ID Pakietu</div>
                                    <div className="text-lg font-semibold text-gray-900">{pkg.custom_id}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Typ pakietu</div>
                                    <div className="text-lg font-semibold text-gray-900">{pkg.package_type_name || `Pakiet ${pkg.package_type}`}</div>
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
                            <div className="mb-8">
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
                                        className={`h-4 rounded-full transition-all duration-300 ${
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

                            {/* Notes Section */}
                            <div className="mb-6">
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900 flex items-center">
                                            <span className="mr-2">📝</span>
                                            Uwagi dodatkowe
                                        </h4>
                                        {!isEditingNotes && (
                                            <button
                                                onClick={() => setIsEditingNotes(true)}
                                                className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                                            >
                                                Edytuj
                                            </button>
                                        )}
                                    </div>

                                    {isEditingNotes ? (
                                        <div>
                                            <textarea
                                                value={notesData.notes}
                                                onChange={(e) => setNotesData('notes', e.target.value)}
                                                maxLength={500}
                                                rows={4}
                                                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                placeholder="np. Jacuzzi VIP z przystawkami, preferencje klienta..."
                                            />
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs text-gray-500">
                                                    {notesData.notes.length} / 500
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleCancelEditNotes}
                                                        disabled={processingNotes}
                                                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                                                    >
                                                        Anuluj
                                                    </button>
                                                    <button
                                                        onClick={handleSaveNotes}
                                                        disabled={processingNotes}
                                                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                                                    >
                                                        {processingNotes ? 'Zapisywanie...' : 'Zapisz'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-700">
                                            {pkg.notes ? (
                                                <p className="whitespace-pre-wrap">{pkg.notes}</p>
                                            ) : (
                                                <p className="text-gray-400 italic">Brak uwag</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-6"></div>

                            {/* Services Section */}
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

                            {/* Extra Services Section */}
                            {pkg.extra_usages && pkg.extra_usages.length > 0 && (
                                <>
                                    <div className="border-t-2 border-gray-300 my-8"></div>

                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <span className="mr-2">✨</span>
                                            Usługi dodatkowe
                                        </h3>
                                        <div className="space-y-3">
                                            {pkg.extra_usages.map((usage) => (
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
                                                            onChange={() => handleToggleUsage(usage)}
                                                            className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <div className="ml-3 flex-1">
                                                            <div className="font-medium text-gray-900">
                                                                {usage.service_name}
                                                            </div>
                                                            {usage.service_description && (
                                                                <div className="text-sm text-gray-600 mt-1 italic">
                                                                    {usage.service_description}
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
                                        <div className="mt-3 text-xs text-gray-500 italic text-center">
                                            Usługi dodatkowe nie wpływają na procent wykorzystania pakietu
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                Czy na pewno chcesz cofnąć wykorzystanie usługi?
                            </h3>
                            <p className="text-sm text-gray-600 text-center mb-6">
                                Usługa: <span className="font-semibold">{pendingServiceName}</span>
                            </p>
                            <p className="text-xs text-gray-500 text-center mb-6">
                                Po potwierdzeniu, usługa będzie ponownie dostępna do wykorzystania.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelUnmark}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    onClick={handleConfirmUnmark}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                                >
                                    Tak, cofnij
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
