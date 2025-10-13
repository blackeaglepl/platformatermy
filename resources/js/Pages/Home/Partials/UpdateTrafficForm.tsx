import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {Field, Label, Radio, RadioGroup, Transition} from "@headlessui/react";

const values = [1, 2, 3];
const labels = ['Mały &nbsp;&nbsp;&nbsp;&nbsp;(<50 os.)', 'Średni &nbsp;(50-70 os.)', 'Duży &nbsp;&nbsp;&nbsp;&nbsp;(>70 os.)']
const colors = ['data-[checked]:bg-[#90BE6D]', 'data-[checked]:bg-[#F1C179]', 'data-[checked]:bg-[#F17979]']

export default function UpdateTrafficForm({ value,  className = '' }: {  value: string;  className?: string }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            value: value,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('dashboard.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Aktualny ruch
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Aby zaktualizować informacje o ruchu wybierz odpowiednią opcję i zapisz
                </p>
            </header>

            <form onSubmit={submit} className="mt-3 space-y-6">
                <RadioGroup value={data.value as unknown as string} onChange={ (value) => setData('value', value) }  className="pt-2">
                    {values.map((val, i) => (
                        <Field key={val} className="flex items-center gap-2 hover:cursor-pointer">
                            <Radio
                                value={val.toString()}
                                className={'group flex size-5 items-center justify-center rounded-full border bg-white hover:cursor-pointer my-2 ' + colors[i]}
                            >
                                <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible"/>
                            </Radio>
                            <Label className="hover:cursor-pointer" dangerouslySetInnerHTML={{ __html: labels[i]}}></Label>
                        </Field>
                    ))}
                </RadioGroup>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Zapisz</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600">
                            Zapisano.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
