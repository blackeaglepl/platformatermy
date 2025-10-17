import { PackageServiceUsage } from '@/types/package';
import { router } from '@inertiajs/react';

interface Props {
    variantGroup: string;
    services: PackageServiceUsage[];
    isToggling: number | null;
    onToggle: (usage: PackageServiceUsage) => void;
}

export default function VariantServiceGroup({ variantGroup, services, isToggling, onToggle }: Props) {
    // Group services into variants (pairs or sets)
    // Assumption: services come in order, pair them sequentially
    // For Pakiet 4: [masaż relaksacyjny, zabieg twarzy, masaż shea, peeling]
    // Variant A = [0, 1], Variant B = [2, 3]

    const variantsData: Array<{label: string, services: PackageServiceUsage[]}> = [];

    // Group by 2 (each variant has 2 services for Pakiet 4)
    // TODO: Make this more flexible if needed
    for (let i = 0; i < services.length; i += 2) {
        const variantServices = services.slice(i, i + 2);
        const label = String.fromCharCode(65 + (i / 2)); // A, B, C...
        variantsData.push({
            label: `Wariant ${label}`,
            services: variantServices
        });
    }

    // Check if any service in this variant is selected
    const isVariantSelected = (variantServices: PackageServiceUsage[]) => {
        return variantServices.some(s => s.is_used);
    };

    // Check if ALL services in this variant are selected
    const isVariantFullySelected = (variantServices: PackageServiceUsage[]) => {
        return variantServices.every(s => s.is_used);
    };

    const handleSelectVariant = (variantServices: PackageServiceUsage[]) => {
        const fullySelected = isVariantFullySelected(variantServices);

        if (fullySelected) {
            // Unmark all services in this variant
            variantServices.forEach(service => {
                if (service.is_used) {
                    onToggle(service);
                }
            });
        } else {
            // First, unmark all services from OTHER variants
            const otherVariantServices = services.filter(s => !variantServices.includes(s) && s.is_used);

            if (otherVariantServices.length > 0) {
                // Unmark other variants first
                otherVariantServices.forEach(service => {
                    router.post(
                        route('package-usage.toggle', service.id),
                        {},
                        { preserveScroll: true }
                    );
                });
            }

            // Then mark all services in the selected variant
            variantServices.forEach(service => {
                if (!service.is_used) {
                    onToggle(service);
                }
            });
        }
    };

    const anyVariantSelected = services.some(s => s.is_used);

    return (
        <div className="mb-4">
            <div className="space-y-2">
                {variantsData.map((variant, variantIndex) => {
                    const isSelected = isVariantFullySelected(variant.services);
                    const isPartiallySelected = isVariantSelected(variant.services) && !isSelected;

                    return (
                        <div
                            key={`variant-${variantIndex}`}
                            onClick={() => handleSelectVariant(variant.services)}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                isSelected
                                    ? 'bg-green-50 border-green-400 shadow-md'
                                    : isPartiallySelected
                                    ? 'bg-yellow-50 border-yellow-300'
                                    : 'bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="radio"
                                    name={`variant-${variantGroup}`}
                                    checked={isSelected}
                                    readOnly
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
