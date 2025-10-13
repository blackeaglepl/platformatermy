// import {InputHTMLAttributes, useState} from 'react';
// import {Field, Label, Radio, RadioGroup} from "@headlessui/react";
//
// const values = ['WARNING', 'PROMO', 'INFO']
// const labels = ['Ostrzeżenie', 'Promocja', 'Informacja']
//
// export default function AlertRadioGroup({
//                                             className = '',
//                                             ...props
//                                         }: InputHTMLAttributes<HTMLInputElement>) {
//
//     let [selected, setSelected] = useState(props.value as string)
//
//     const handleChange = (value: string): void => {
//         setSelected(value);
//         props.setData("type", value)
//     }
//
//     return (
//         <RadioGroup value={selected} onChange={handleChange} aria-label="Server size" className={'' + className}>
//             {values.map((value, i) => (
//                 <Field key={value} className="flex items-center gap-2 hover:cursor-pointer">
//                     <Radio
//                         value={value}
//                         className="group flex size-5 items-center justify-center rounded-full border bg-white hover:cursor-pointer my-2 data-[checked]:bg-[#0055aa]"
//                     >
//                         <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible"/>
//                     </Radio>
//                     <Label className="hover:cursor-pointer" dangerouslySetInnerHTML={{__html: labels[i]}}></Label>
//                 </Field>
//             ))}
//         </RadioGroup>
//     );
// }
