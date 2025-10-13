import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import {Field, Label, Radio, RadioGroup, Switch, Transition} from '@headlessui/react';
import {useForm} from '@inertiajs/react';
import {FormEventHandler} from 'react';

const values = ['WARNING', 'INFO', 'PROMO', 'OTHER']
const labels = ['Uwaga', 'Informacja', 'Promocja', 'Pozostałe']

export default function UpdateAlertForm(
    {
        alertType,
        alertMessage,
        className = '',
        alertEnabled,
    }: {
        alertType: string;
        alertMessage: string;
        className?: string;
        alertEnabled: boolean;
    }) {

    const {data, setData, patch, errors, processing, recentlySuccessful} =
        useForm({
            type: alertType,
            text: alertMessage,
            enabled: alertEnabled,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('dashboard.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Komunikat</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Aby ustawić żądany komnikat włącz tę opcję, wybierz typ, uzupełnij treść, a następnie zapisz
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <Field className="flex gap-3">
                    <Switch
                        checked={data.enabled}
                        onChange={(value) => setData("enabled", value)}
                        className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-blue-600"
                    >
                        <span
                            className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6"/>
                    </Switch>
                    <Label>
                        Włączony
                    </Label>
                </Field>

                <div>
                    <InputLabel htmlFor="name" value="Typ" disabled={!data.enabled}/>
                    <RadioGroup value={data.type}
                                onChange={(value) => setData("type", value)}
                                className={'' + className}>
                        {values.map((value, i) => (
                            <Field key={value} disabled={!data.enabled}
                                   className="flex items-center gap-2 hover:cursor-pointer">
                                <Radio
                                    value={value}
                                    className={"group flex size-5 items-center justify-center rounded-full border bg-white hover:cursor-pointer my-2 data-[checked]:bg-[#0055aa] data-[disabled]:bg-gray-100"}
                                >
                                    <span
                                        className="invisible size-2 rounded-full bg-white group-data-[checked]:visible group-data-[disabled]:bg-gray-300"/>
                                </Radio>
                                <Label className="hover:cursor-pointer data-[disabled]:text-gray-300"
                                       dangerouslySetInnerHTML={{__html: labels[i]}}></Label>
                            </Field>
                        ))}
                    </RadioGroup>
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Treść" disabled={!data.enabled}/>
                    <TextInput
                        id="name"
                        name="name"
                        value={data.text}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData("text", e.target.value)}
                        required
                        disabled={!data.enabled}
                    />
                    <InputError message={errors.text} className="mt-2"/>
                </div>

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
