import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { PackageWithUsages, PackageServiceUsage } from '@/types/package';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import VariantServiceGroup from '@/Components/VariantServiceGroup';
import PersonServiceSelector from '@/Components/PersonServiceSelector';

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
    const [isEditingOwner, setIsEditingOwner] = useState(false);
    const [isEditingGuestCount, setIsEditingGuestCount] = useState(false);
    const [isToggling, setIsToggling] = useState<number | null>(null); // Track which service is being toggled

    const { data: notesData, setData: setNotesData, patch: patchNotes, processing: processingNotes } = useForm({
        notes: pkg.notes || '',
    });

    const { data: ownerData, setData: setOwnerData, patch: patchOwner, processing: processingOwner } = useForm({
        owner_name: pkg.owner_name || '',
    });

    const { data: guestCountData, setData: setGuestCountData, patch: patchGuestCount, processing: processingGuestCount } = useForm({
        guest_count: pkg.guest_count || '',
    });

    const handleToggleUsage = (usage: PackageServiceUsage) => {
        // Prevent double-clicking
        if (isToggling === usage.id) {
            return;
        }

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
        // Set toggling state to prevent duplicate requests
        setIsToggling(usageId);

        router.post(
            route('package-usage.toggle', usageId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowConfirmModal(false);
                    setPendingUsageId(null);
                    setPendingServiceName('');
                    setIsToggling(null); // Clear toggling state
                },
                onError: () => {
                    setIsToggling(null); // Clear toggling state on error
                },
                onFinish: () => {
                    // Fallback to ensure state is cleared
                    setTimeout(() => setIsToggling(null), 500);
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

    const handleSaveOwner = () => {
        patchOwner(route('packages.update-owner', pkg.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingOwner(false);
            }
        });
    };

    const handleCancelEditOwner = () => {
        setOwnerData('owner_name', pkg.owner_name || '');
        setIsEditingOwner(false);
    };

    const handleSaveGuestCount = () => {
        patchGuestCount(route('packages.update-guest-count', pkg.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingGuestCount(false);
            }
        });
    };

    const handleCancelEditGuestCount = () => {
        setGuestCountData('guest_count', pkg.guest_count || '');
        setIsEditingGuestCount(false);
    };

    const renderServiceList = (services: PackageServiceUsage[], title: string, icon: string) => {
        if (!services || services.length === 0) {
            return null;
        }

        // Group services by variant_group
        const variantGroups: Record<string, PackageServiceUsage[]> = {};
        const regularServices: PackageServiceUsage[] = [];

        services.forEach((service) => {
            if (service.variant_group) {
                // For "osoba1_masaz", "osoba2_masaz" → keep full group name (don't strip suffix)
                // For "odnowa_a", "odnowa_b" → group together as "odnowa"
                const isPersonGroup = service.variant_group.startsWith('osoba');
                const baseGroupName = isPersonGroup
                    ? service.variant_group  // Keep full: "osoba1_masaz", "osoba2_masaz"
                    : service.variant_group.replace(/_[a-z]$/i, ''); // Strip suffix: "odnowa"

                if (!variantGroups[baseGroupName]) {
                    variantGroups[baseGroupName] = [];
                }
                variantGroups[baseGroupName].push(service);
            } else {
                regularServices.push(service);
            }
        });

        // Sort services within each variant group by variant_group name (odnowa_a before odnowa_b)
        Object.keys(variantGroups).forEach(groupName => {
            variantGroups[groupName].sort((a, b) =>
                (a.variant_group || '').localeCompare(b.variant_group || '')
            );
        });

        return (
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">{icon}</span>
                    {title}
                </h3>
                <div className="space-y-3">
                    {/* Render variant groups first */}
                    {Object.entries(variantGroups).map(([groupName, groupServices]) => {
                        // Use PersonServiceSelector for "osobaX_*" groups (Pakiet 6: Szept Miłości)
                        const isPersonGroup = groupName.startsWith('osoba');

                        if (isPersonGroup) {
                            return (
                                <PersonServiceSelector
                                    key={groupName}
                                    packageId={pkg.id}
                                    variantGroup={groupName}
                                    services={groupServices}
                                    isToggling={isToggling}
                                    onToggle={handleToggleUsage}
                                />
                            );
                        }

                        // Use VariantServiceGroup for other variants (Pakiet 4)
                        return (
                            <VariantServiceGroup
                                key={groupName}
                                packageId={pkg.id}
                                variantGroup={groupName}
                                services={groupServices}
                                isToggling={isToggling}
                                onToggle={handleToggleUsage}
                            />
                        );
                    })}

                    {/* Then render regular services */}
                    {regularServices.map((usage) => (
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
                                    disabled={isToggling === usage.id}
                                    className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        Pakiet: {pkg.package_id}
                    </h2>
                    <div className="flex items-center gap-4">
                        <a
                            href={route('packages.pdf', pkg.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest focus:outline-none focus:ring transition ease-in-out duration-150"
                            style={{ backgroundColor: '#1356A3' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f4580'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1356A3'}
                        >
                            📄 Pobierz PDF
                        </a>
                        <Link
                            href={route('packages.index')}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            ← Powrót do listy
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Pakiet ${pkg.package_id}`} />

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
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">ID Pakietu</div>
                                    <div className="text-lg font-mono font-semibold text-gray-900">{pkg.package_id}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Posiadacz</div>
                                    {isEditingOwner ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={ownerData.owner_name}
                                                onChange={(e) => setOwnerData('owner_name', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSaveOwner}
                                                disabled={processingOwner}
                                                className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                                                title="Zapisz"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={handleCancelEditOwner}
                                                disabled={processingOwner}
                                                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                                                title="Anuluj"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="text-lg font-semibold text-gray-900">{pkg.owner_name}</div>
                                            <button
                                                onClick={() => setIsEditingOwner(true)}
                                                className="text-sm text-indigo-600 hover:text-indigo-900"
                                                title="Edytuj posiadacza"
                                            >
                                                ✎
                                            </button>
                                        </div>
                                    )}
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
                                    '💧'
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

                            {/* Variant Services Section (DO WYBORU) */}
                            {pkg.variant_services && Object.keys(pkg.variant_services).length > 0 && (
                                <>
                                    <div className="border-t-2 border-gray-300 my-8"></div>

                                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                                            <span className="mr-2">🔄</span>
                                            Warianty usług DO WYBORU
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4 italic">
                                            Klient może wybrać jeden z poniższych wariantów. Dodaj wybraną usługę klikając przycisk "Dodaj".
                                        </p>

                                        {Object.entries(pkg.variant_services).map(([groupName, services]) => (
                                            <div key={groupName} className="mb-4 last:mb-0">
                                                <div className="font-semibold text-gray-700 mb-2 text-sm">
                                                    Grupa: {groupName}
                                                </div>
                                                <div className="space-y-2">
                                                    {services.map((service) => (
                                                        <div
                                                            key={service.id}
                                                            className="p-3 rounded-lg border bg-white border-purple-200 flex items-start justify-between"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-900">
                                                                    {service.name}
                                                                </div>
                                                                {service.description && (
                                                                    <div className="text-sm text-gray-500 mt-1">
                                                                        {service.description}
                                                                    </div>
                                                                )}
                                                                {service.duration && (
                                                                    <div className="text-xs text-gray-400 mt-1">
                                                                        Czas trwania: {service.duration} min
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    router.post(
                                                                        route('packages.add-variant', pkg.id),
                                                                        { service_id: service.id },
                                                                        { preserveScroll: true }
                                                                    );
                                                                }}
                                                                className="ml-4 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex-shrink-0"
                                                            >
                                                                + Dodaj
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Guest Count Section - Only for package types 4-6 */}
                            {pkg.package_type >= 4 && (
                                <>
                                    <div className="border-t-2 border-gray-300 my-8"></div>

                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <span className="mr-2">👥</span>
                                            Liczba osób korzystających z pakietu
                                        </h3>

                                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                                            {isEditingGuestCount ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Liczba osób
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="50"
                                                            value={guestCountData.guest_count}
                                                            onChange={(e) => setGuestCountData('guest_count', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="Wpisz liczbę osób..."
                                                            disabled={processingGuestCount}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handleSaveGuestCount}
                                                            disabled={processingGuestCount}
                                                            className="px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            style={{ backgroundColor: '#1356A3' }}
                                                            onMouseEnter={(e) => !processingGuestCount && (e.currentTarget.style.backgroundColor = '#0f4580')}
                                                            onMouseLeave={(e) => !processingGuestCount && (e.currentTarget.style.backgroundColor = '#1356A3')}
                                                        >
                                                            {processingGuestCount ? 'Zapisywanie...' : 'Zapisz'}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEditGuestCount}
                                                            disabled={processingGuestCount}
                                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Anuluj
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        {pkg.guest_count ? (
                                                            <div className="text-gray-900 font-medium">
                                                                👥 {pkg.guest_count} {pkg.guest_count === 1 ? 'osoba' : pkg.guest_count < 5 ? 'osoby' : 'osób'}
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-500 italic">
                                                                Nie określono liczby osób
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setIsEditingGuestCount(true)}
                                                        className="px-4 py-2 rounded-lg transition-colors"
                                                        style={{ backgroundColor: '#E3F2FD', color: '#1356A3' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BBDEFB'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E3F2FD'}
                                                    >
                                                        {pkg.guest_count ? 'Edytuj' : 'Dodaj liczbę osób'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 text-xs text-gray-500 italic text-center">
                                            ℹ️ To pole nie wpływa na procent realizacji pakietu - służy tylko jako informacja dla personelu
                                        </div>
                                    </div>
                                </>
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
                                                            disabled={isToggling === usage.id}
                                                            className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

                            {/* History Section */}
                            {pkg.logs && pkg.logs.length > 0 && (
                                <>
                                    <div className="border-t-2 border-gray-300 my-8"></div>

                                    <div className="bg-gray-50 rounded-lg border-2 border-gray-300 overflow-hidden">
                                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                                <span className="mr-2">✅</span>
                                                Akcje
                                            </h3>
                                        </div>

                                        <div className="p-4">
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {pkg.logs.map((log) => {
                                                    // Determine if this is an "unmark" action (orange/red color)
                                                    const isUnmarkAction = log.action.toLowerCase().includes('odznaczono');
                                                    const dotColor = isUnmarkAction ? 'bg-orange-500' : 'bg-indigo-500';

                                                    return (
                                                        <div
                                                            key={log.id}
                                                            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${dotColor}`}></div>

                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-gray-900 font-medium">
                                                                    {log.action}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                    <span className="font-semibold">{log.user_name}</span>
                                                                    <span>•</span>
                                                                    <span>{log.created_at}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {pkg.logs.length === 40 && (
                                                <div className="mt-3 text-center text-xs text-gray-400 italic">
                                                    Wyświetlono maksymalnie 40 ostatnich akcji
                                                </div>
                                            )}
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
