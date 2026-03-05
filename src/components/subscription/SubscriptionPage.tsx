import { CheckCircle2, Zap, CreditCard, Shield } from "lucide-react";
import { SUBSCRIPTION_PLANS, CURRENT_USER } from "@/lib/constants/mockData";
import { cn } from "@/lib/utils";

export function SubscriptionPage() {
  const handleSubscribe = (planId: string) => {
    if (planId === "free") return;
    alert(`Razorpay integration: Opening payment for ${planId} plan...`);
  };

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-2">
          <CreditCard size={24} className="text-blue-600" /> Choose Your Plan
        </h1>
        <p className="text-gray-500">Affordable pricing designed for every aspirant's budget</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <p className="text-blue-700 text-sm">
          Current plan: <span className="font-bold capitalize">{CURRENT_USER.subscriptionPlan}</span>
          {CURRENT_USER.subscriptionPlan !== "annual" && (
            <span className="ml-2 text-blue-600">— Upgrade to unlock all features</span>
          )}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SUBSCRIPTION_PLANS.map(plan => {
          const isCurrent = plan.id === CURRENT_USER.subscriptionPlan;
          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-2xl border-2 p-5 flex flex-col relative transition-shadow",
                plan.isPopular
                  ? "border-blue-500 shadow-xl shadow-blue-100"
                  : "border-gray-100 shadow-sm hover:shadow-md"
              )}
            >
              {plan.badge && (
                <div className={cn(
                  "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
                  plan.isPopular ? "bg-blue-600 text-white" : "bg-gray-800 text-white"
                )}>
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-400 text-sm mb-1">/{plan.duration}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5 mb-5">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <div className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold text-center">
                  Current Plan ✓
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                    plan.isPopular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : plan.id === "free"
                      ? "border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  )}
                >
                  {plan.id === "free" ? "Get Started" : <><Zap size={14} /> Subscribe Now</>}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Razorpay Note */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-center gap-3 text-sm text-gray-500">
        <Shield size={16} className="text-green-500" />
        Secured payments via Razorpay · UPI · Cards · Net Banking · EMI available
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <h2 className="font-bold text-gray-900 text-lg">Frequently Asked Questions</h2>
        {[
          {
            q: "Can I cancel my subscription anytime?",
            a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of the paid period.",
          },
          {
            q: "What payment methods are supported?",
            a: "We accept UPI (PhonePe, GPay, Paytm), Debit/Credit Cards, Net Banking, and EMI via Razorpay.",
          },
          {
            q: "Is there a free trial?",
            a: "Yes! Our free plan lets you take 1 mock test per week and access 50 PYQ questions — no credit card required.",
          },
          {
            q: "Do you offer refunds?",
            a: "We offer a 7-day refund policy. Contact support within 7 days of purchase if you're not satisfied.",
          },
        ].map((faq, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="font-semibold text-gray-800 text-sm mb-1">Q: {faq.q}</div>
            <div className="text-gray-500 text-sm">A: {faq.a}</div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800">Plan Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Free</th>
                <th className="text-center py-3 px-4 font-semibold text-blue-700">Monthly</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Quarterly</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Annual</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Mock Tests", free: "1/week", monthly: "Unlimited", quarterly: "Unlimited", annual: "Unlimited" },
                { feature: "PYQ Questions", free: "50", monthly: "5000+", quarterly: "5000+", annual: "5000+" },
                { feature: "Analytics", free: "Basic", monthly: "Full", quarterly: "Advanced", annual: "Advanced" },
                { feature: "SC/ST/OBC Guide", free: "✗", monthly: "✓", quarterly: "✓", annual: "✓" },
                { feature: "Study Planner", free: "✗", monthly: "✓", quarterly: "✓", annual: "✓" },
                { feature: "Leaderboard", free: "✗", monthly: "✓", quarterly: "✓", annual: "✓" },
                { feature: "Ad-free", free: "✗", monthly: "✓", quarterly: "✓", annual: "✓" },
                { feature: "Mentorship", free: "✗", monthly: "✗", quarterly: "✗", annual: "1 session" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium text-gray-700">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-gray-500">{row.free}</td>
                  <td className="py-3 px-4 text-center font-medium text-blue-700 bg-blue-50/30">{row.monthly}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{row.quarterly}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{row.annual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
