import { PackageServiceUsage } from '@/types/package';
import { router } from '@inertiajs/react';

interface Props {
    packageId: number;
    variantGroup: string;
    services: PackageServiceUsage[];
    isToggling: number | null;
    onUnmarkConfirm?: (variantServices: PackageServiceUsage[]) => void;
}

export default function VariantServiceGroup({ packageId, variantGroup, services, isToggling, onUnmarkConfirm }: Props) {
    const getGroupTitle = (groupName: string): string => {
        const osobaMatch = groupName.match(/^osoba(\d+)_/);
        if (osobaMatch) {
            return `Wybierz usługę dla Osoby ${osobaMatch[1]}`;
        }
        return `Wybierz wariant`;
    };

    const variantsData: Array<{label: string, services: PackageServiceUsage[]}> = [];

    // Group services by their variant_group (e.g., odnowa_a, odnowa_b)
    const groupedByVariant = services.reduce((acc, service) => {
        const group = service.variant_group || 'default';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(service);
        return acc;
    }, {} as Record<string, PackageServiceUsage[]>);

    // Sort variant groups alphabetically and create variants data
    const sortedGroups = Object.keys(groupedByVariant).sort();
    sortedGroups.forEach((group, index) => {
        const label = String.fromCharCode(65 + index); // A, B, C...
        variantsData.push({
            label: `Wariant ${label}`,
            services: groupedByVariant[group]
        });
    });

    const isVariantFullySelected = (variantServices: PackageServiceUsage[]) => {
        if (variantServices.length === 0) return false;
        return variantServices.every(s => s.is_used);
    };

    const handleSelectVariant = (variantServices: PackageServiceUsage[]) => {
        if (isToggling) return; // Prevent action if another is in progress

        const isCurrentlySelected = isVariantFullySelected(variantServices);

        // If trying to unmark and callback provided, show confirmation modal
        if (isCurrentlySelected && onUnmarkConfirm) {
            onUnmarkConfirm(variantServices);
            return;
        }

        // Otherwise proceed with selection/deselection
        const serviceIds = isCurrentlySelected ? [] : variantServices.map(s => s.id);

        router.post(
            route('package-usage.select-variant'),
            {
                package_id: packageId,
                variant_group: variantGroup,
                service_ids: serviceIds,
            },
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="mb-4">
            <div className="mb-3">
                <h4 className="font-semibold text-gray-800 text-sm">
                    {getGroupTitle(variantGroup)}:
                </h4>
            </div>
            <div className="space-y-2">
                {variantsData.map((variant, variantIndex) => {
                    const isSelected = isVariantFullySelected(variant.services);
                    const isDisabled = isToggling !== null;

                    return (
                        <div
                            key={`variant-${variantIndex}`}
                            onClick={() => !isDisabled && handleSelectVariant(variant.services)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                isDisabled
                                    ? 'cursor-not-allowed opacity-60'
                                    : 'cursor-pointer'
                            } ${
                                isSelected
                                    ? 'bg-green-50 border-green-400 shadow-md'
                                    : 'bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="radio"
                                    name={`variant-${variantGroup}`}
                                    checked={isSelected}
                                    readOnly
                                    disabled={isDisabled}
                                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <div className="font-bold text-gray-900 mb-2">
                                        {variant.label}:
                                    </div>
                                    <div className="space-y-1 ml-1">
                                        {variant.services.map((service) => (
                                            <div key={service.id} className="flex items-start gap-2">
                                                <span className="text-gray-400 mt-1">•</span>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-800">
                                                        {service.service_name}
                                                    </div>
                                                    {service.service_description && (
                                                        <div className="text-sm text-gray-600">
                                                            {service.service_description}
                                                        </div>
                                                    )}
                                                    {service.service_duration && (
                                                        <div className="text-xs text-gray-500">
                                                            Czas trwania: {service.service_duration} min
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {isSelected && (
                                        <div className="text-xs text-green-700 font-semibold mt-3 flex items-center gap-1">
                                            <span>✓</span>
                                            <span>Wybrany i wykorzystany</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}