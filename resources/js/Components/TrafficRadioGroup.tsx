// import {InputHTMLAttributes, useState} from 'react';
// import {Field, Label, Radio, RadioGroup} from "@headlessui/react";
//
// const values = ['1', '2', '3']
// const labels = ['Mały &nbsp;&nbsp;&nbsp;&nbsp;(<50 os.)', 'Średni &nbsp;(50-70 os.)', 'Duży &nbsp;&nbsp;&nbsp;&nbsp;(>70 os.)']
// const colors = ['data-[checked]:bg-[#90BE6D]', 'data-[checked]:bg-[#F1C179]', 'data-[checked]:bg-[#F17979]']
//
// export default function TrafficRadioGroup({
//                                      className = '',
//                                      ...props
//                                  }: InputHTMLAttributes<HTMLInputElement>) {
//     let [selected, setSelected] = useState(props.value as string)
//
//     return (
//         <RadioGroup value={selected} onChange={setSelected} aria-label="Server size" className={className?.toString()}>
//             {values.map((value, i) => (
//                 <Field key={value} className="flex items-center gap-2 hover:cursor-pointer">
//                     <Radio
//                         value={value}
//                         className={'group flex size-5 items-center justify-center rounded-full border bg-white hover:cursor-pointer my-2 ' + colors[i]}
//                     >
//                         <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible"/>
//                     </Radio>
//                     <Label className="hover:cursor-pointer" dangerouslySetInnerHTML={{ __html: labels[i]}}></Label>
//                 </Field>
//             ))}
//         </RadioGroup>
//     );
// }
