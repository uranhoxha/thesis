import YellowPaper from "@/public/papers/yellow-paper.svg";
import RedPaper from "@/public/papers/red-paper.svg";
import GreenPaper from "@/public/papers/green-paper.svg";
import BluePaper from "@/public/papers/blue-paper.svg";
import Image from "next/image";

export default function AuthBg() {
  return (
    <>
      <div className="absolute -top-20 -left-20 w-[512px] h-[512px] rotate-12 hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
        <Image
          src={YellowPaper}
          alt="decoration"
          fill
          className="object-contain"
        />
      </div>
      <div className="absolute -bottom-10 -right-20 w-[576px] h-[576px] -rotate-6 hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
        <Image
          src={YellowPaper}
          alt="decoration"
          fill
          className="object-contain"
        />
      </div>

      <div className="absolute -top-40 -right-30 w-[640px] h-[640px] -rotate-45 hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
        <Image
          src={RedPaper}
          alt="decoration"
          fill
          className="object-contain"
        />
      </div>
      <div className="absolute -bottom-40 left-[20%] w-[448px] h-[448px] -rotate-60 hover:scale-110 hover:-rotate-50 transition-all duration-500 cursor-pointer">
        <Image
          src={RedPaper}
          alt="decoration"
          fill
          className="object-contain"
        />
      </div>

      <div className="absolute top-1/2 -left-24 w-[512px] h-[512px] rotate-20 hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
        <Image
          src={GreenPaper}
          alt="decoration"
          fill
          className="object-contain"
        />
      </div>
      <div className="absolute -bottom-70 right-30 w-[640px] h-[640px] rotate-30 hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
        <Image
          src={GreenPaper}
          alt="decoration"
          fill
          className="object-contain"
        />
      </div>

      <div className="absolute -bottom-70 -right-40 w-[576px] h-[576px] rotate-12 hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
        <Image
          src={BluePaper}
          alt="decoration"
          fill
          className="object-contain"
        />
      </div>
      <div className="absolute bottom-1/4 -left-40 w-[512px] h-[512px] -rotate-3 hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
        <Image
          src={BluePaper}
          alt="decoration"
          fill
          className="object-contain"
        />
      </div>
    </>
  );
}
