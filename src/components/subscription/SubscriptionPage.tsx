import { CheckCircle2, Zap, CreditCard, Shield, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { subscriptionsApi, authApi } from "@/lib/api";
import { adaptUser } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SubscriptionPage() {
  const { data: apiUser } = useQuery({ queryKey: ["me"], queryFn: authApi.getMe, retry: false });
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: subscriptionsApi.getPlans,
  });
  const { data: mySubscription } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: subscriptionsApi.getMy,
    retry: false,
  });

  const user = apiUser ? adaptUser(apiUser) : null;
  const planList = Array.isArray(plans) ? plans : [];
  const currentPlan = mySubscription?.plan ?? user?.subscriptionPlan ?? "free";

  const orderMutation = useMutation({
    mutationFn: subscriptionsApi.createOrder,
    onSuccess: (data) => {
      toast.info(`Order created: ${data.orderId}. Integrate Razorpay to complete payment.`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubscribe = (planId: string) => {
    if (planId === "free") return;
    orderMutation.mutate(planId);
  };

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-2">
          <CreditCard size={24} className="text-orange-500" /> Choose Your Plan
        </h1>
        <p className="text-gray-500">Affordable pricing designed for every aspirant's budget</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
        <p className="text-orange-700 text-sm">
          Current plan: <span className="font-bold capitalize">{currentPlan}</span>
          {currentPlan !== "annual" && (
            <span className="ml-2 text-orange-600">— Upgrade to unlock all features</span>
          )}
        </p>
        {mySubscription?.expiresAt && (
          <p className="text-orange-500 text-xs mt-1">
            Expires: {new Date(mySubscription.expiresAt).toLocaleDateString("en-IN")}
          </p>
        )}
      </div>

      {/* Plans Grid */}
      {planList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {planList.map(plan => {
            const isCurrent = plan.id === currentPlan;
            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-2xl border-2 p-5 flex flex-col relative transition-shadow",
                  plan.isPopular
                    ? "border-orange-500 shadow-xl shadow-orange-100"
                    : "border-gray-100 shadow-sm hover:shadow-md"
                )}
              >
                {plan.badge && (
                  <div className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
                    plan.isPopular ? "bg-orange-500 text-white" : "bg-gray-800 text-white"
                  )}>
                    {plan.badge}
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-400 text-sm mb-1">/{plan.duration}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-2.5 mb-5">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold text-center">
                    Current Plan ✓
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={orderMutation.isPending}
                    className={cn(
                      "w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                      plan.isPopular
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : plan.id === "free"
                        ? "border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    )}
                  >
                    {orderMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                    {plan.id === "free" ? "Get Started" : <><Zap size={14} /> Subscribe Now</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Fallback comparison table if no plans from API
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
          <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Plans information unavailable. Please try again later.</p>
        </div>
      )}

      {/* Razorpay Note */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-center gap-3 text-sm text-gray-500">
        <Shield size={16} className="text-green-500" />
        Secured payments via Razorpay · UPI · Cards · Net Banking · EMI available
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <h2 className="font-bold text-gray-900 text-lg">Frequently Asked Questions</h2>
        {[
          { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of the paid period." },
          { q: "What payment methods are supported?", a: "We accept UPI (PhonePe, GPay, Paytm), Debit/Credit Cards, Net Banking, and EMI via Razorpay." },
          { q: "Is there a free trial?", a: "Yes! Our free plan lets you take 1 mock test per week and access PYQ questions — no credit card required." },
          { q: "Do you offer refunds?", a: "We offer a 7-day refund policy. Contact support within 7 days of purchase if you're not satisfied." },
        ].map((faq, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="font-semibold text-gray-800 text-sm mb-1">Q: {faq.q}</div>
            <div className="text-gray-500 text-sm">A: {faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
