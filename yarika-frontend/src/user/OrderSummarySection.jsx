import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Edit, Minus, Plus, Trash2 } from "lucide-react";
import React from "react";

export const OrderSummarySection = () => {
  return (
    <div className="w-full relative">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="w-[308px] h-[307px] bg-[#d9d9d9] rounded-lg flex-shrink-0" />

            <div className="flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <h2 className="[font-family:'Inter-Medium',Helvetica] font-medium text-smoke-black text-3xl tracking-[0] leading-[50px]">
                  Kalamkari Print Blouse
                </h2>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="w-8 h-8 p-0">
                    <Edit className="w-[25px] h-[25px]" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 p-0">
                    <Trash2 className="w-8 h-8" />
                  </Button>
                </div>
              </div>

              <div className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#c9ac5d] text-xl tracking-[0] leading-[normal] mb-4">
                Bl.dw.kk.00075
              </div>

              <div className="[font-family:'Inter-Light',Helvetica] font-normal text-smoke-black text-[25px] tracking-[0] leading-[50px] mb-4">
                <span className="font-light">Color : </span>
                <span className="[font-family:'Inter-Medium',Helvetica] font-medium">
                  Green
                </span>
              </div>

              <div className="[font-family:'Inter-Light',Helvetica] font-normal text-smoke-black text-[25px] tracking-[0] leading-[50px] mb-8">
                <span className="font-light">size : </span>
                <span className="[font-family:'Inter-Medium',Helvetica] font-medium">
                  36
                </span>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-4">
                  <span className="[font-family:'Inter-Medium',Helvetica] font-medium text-[#c9ac5d] text-[25px] tracking-[0] leading-[50px]">
                    ₹640.00
                  </span>
                  <span className="[font-family:'Inter-Light',Helvetica] font-light text-[#585858] text-[25px] tracking-[0] leading-[50px] line-through">
                    ₹960.00
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded border-2 border-solid border-[#5e5e5e]"
                  >
                    <Minus className="w-6 h-6 text-[#1a1a1a]" />
                  </Button>

                  <span className="[font-family:'Inter-Light',Helvetica] font-light text-smoke-black text-[25px] tracking-[0] leading-[50px] min-w-[20px] text-center">
                    1
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded border-2 border-solid border-[#5e5e5e]"
                  >
                    <Plus className="w-6 h-6 text-[#1a1a1a]" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSummarySection;
