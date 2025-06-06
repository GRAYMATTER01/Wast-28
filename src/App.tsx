import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronRight,
  MapPin,
  Trash2,
  Package,
  FileCheck,
  Calendar,
  CreditCard,
  AlertTriangle,
  X,
  CheckCircle2,
  XCircle,
  Star,
  Award,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchSkips } from "@/lib/api";
import type { SkipOption } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkipHirePage() {
  const [activeStep, setActiveStep] = useState(3); // Select Skip is active step (3rd step)
  const [activeTab, setActiveTab] = useState("all");
  const [sortOrder, setSortOrder] = useState("size-asc");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [skipOptions, setSkipOptions] = useState<SkipOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedSkipId, setSelectedSkipId] = useState<number | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingSkipSelection, setPendingSkipSelection] =
    useState<SkipOption | null>(null);

  const steps = [
    { id: 1, name: "Location", icon: MapPin },
    { id: 2, name: "Waste Type", icon: Trash2 },
    { id: 3, name: "Select Skip", icon: Package },
    { id: 4, name: "Permit Check", icon: FileCheck },
    { id: 5, name: "Schedule", icon: Calendar },
    { id: 6, name: "Payment", icon: CreditCard },
  ];

  useEffect(() => {
    const loadSkips = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSkips();
        setSkipOptions(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch skip options:", err);
        setError("Failed to load skip options. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSkips();
  }, []);

  // Get skip image based on size
  const getSkipImage = (size: number): string => {
    const imageMap: { [key: number]: string } = {
      4: "/images/4-yarder-skip.jpg",
      5: "/images/5-yarder-skip.jpg",
      6: "/images/6-yarder-skip.jpg",
      16: "/images/16-yarder-skip.jpg",
      20: "/images/40-yarder-skip.jpg", // Using 40-yard image for 20-yard skip
      40: "/images/40-yarder-skip.jpg",
    };

    // Return specific image if available, otherwise use 8-yarder as fallback
    return imageMap[size] || "/images/8-yarder-skip.jpg";
  };

  // Get skip category based on size
  const getSkipCategory = (size: number): string => {
    if (size <= 6) return "small";
    if (size <= 12) return "medium";
    return "large";
  };

  // Get suitable use cases based on size
  const getSuitableUses = (
    size: number,
    allowsHeavyWaste: boolean
  ): string[] => {
    if (size <= 6) {
      return ["Home Projects", "Garden Cleanup", "Small Renovations"];
    } else if (size <= 12) {
      return ["Renovations", "Construction", "Commercial Use"];
    } else {
      const uses = ["Large Construction", "Industrial", "Commercial"];
      if (allowsHeavyWaste) {
        uses.push("Heavy Materials");
      }
      return uses;
    }
  };

  // Get skip description based on size
  const getSkipDescription = (
    size: number,
    allowsHeavyWaste: boolean
  ): string => {
    if (size <= 6) {
      return `Perfect for household projects and garden waste. Compact ${size} yard capacity.`;
    } else if (size <= 12) {
      return `Ideal for renovation projects and medium construction work. ${size} yard capacity.`;
    } else {
      return `Designed for large-scale projects${
        allowsHeavyWaste ? " including heavy materials" : ""
      }. ${size} yard capacity.`;
    }
  };

  // Calculate total price including VAT
  const calculateTotalPrice = (priceBeforeVat: number, vat: number): string => {
    const vatAmount = (priceBeforeVat * vat) / 100;
    const totalPrice = priceBeforeVat + vatAmount;
    return `£${totalPrice.toFixed(2)}`;
  };

  // Handle skip selection with confirmation modal
  const handleSkipSelection = (skip: SkipOption) => {
    if (selectedSkipId === skip.id) {
      // If already selected, deselect
      setSelectedSkipId(null);
    } else {
      // Show confirmation modal
      setPendingSkipSelection(skip);
      setShowConfirmationModal(true);
    }
  };

  // Confirm skip selection
  const confirmSkipSelection = () => {
    if (pendingSkipSelection) {
      setSelectedSkipId(pendingSkipSelection.id);
      setShowConfirmationModal(false);
      setPendingSkipSelection(null);
    }
  };

  // Cancel skip selection
  const cancelSkipSelection = () => {
    setShowConfirmationModal(false);
    setPendingSkipSelection(null);
  };

  // Filter skips based on active tab and search term
  const filteredSkips = skipOptions.filter((skip) => {
    // Filter by category
    const category = getSkipCategory(skip.size);
    const matchesCategory =
      activeTab === "all" ||
      (activeTab === "small" && category === "small") ||
      (activeTab === "medium" && category === "medium") ||
      (activeTab === "large" && category === "large");

    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      skip.size.toString().includes(searchTerm) ||
      `${skip.size} yard`.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Sort skips based on selected order
  const sortedSkips = [...filteredSkips].sort((a, b) => {
    switch (sortOrder) {
      case "size-asc":
        return a.size - b.size;
      case "size-desc":
        return b.size - a.size;
      case "price-asc":
        return a.price_before_vat - b.price_before_vat;
      case "price-desc":
        return b.price_before_vat - a.price_before_vat;
      default:
        return a.size - b.size;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-mint-50">
      {/* Modern Header with Purple and Mint Theme */}
      <header className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-2">
              <div className="bg-mint-400 p-3 rounded-full mr-4">
                <Trash2 className="h-8 w-8 text-violet-800" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-mint-200 bg-clip-text text-transparent">
                We Want Waste
              </h1>
            </div>
            <p className="text-violet-100 text-lg">
              Professional Waste Management Solutions
            </p>
          </div>
        </div>
      </header>

      {/* Modern Progress Tracker */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg py-6 sticky top-0 z-10 border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center relative ${
                  activeStep >= step.id ? "text-violet-600" : "text-gray-400"
                }`}
              >
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-12 w-full h-0.5 ${
                      activeStep > step.id ? "bg-violet-600" : "bg-gray-200"
                    } hidden sm:block`}
                  ></div>
                )}
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full mb-2 relative z-10 ${
                    activeStep === step.id
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                      : activeStep > step.id
                      ? "bg-mint-400 text-violet-800 shadow-md"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {activeStep > step.id ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block text-center">
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-800 to-purple-600 bg-clip-text text-transparent mb-4">
            Choose Your Perfect Skip
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the ideal waste solution for your project with our premium skip
            hire service
          </p>
          <div className="flex justify-center items-center mt-6 space-x-6">
            <div className="flex items-center text-violet-600">
              <Star className="h-5 w-5 fill-current mr-2" />
              <span className="font-medium">5-Star Service</span>
            </div>
            <div className="flex items-center text-violet-600">
              <Award className="h-5 w-5 fill-current mr-2" />
              <span className="font-medium">Eco-Friendly</span>
            </div>
          </div>
        </div>

        {/* Help Section with Modern Design */}
        <div className="mb-8 bg-gradient-to-r from-mint-100 to-violet-100 rounded-2xl shadow-lg p-8 border border-mint-200">
          <div className="flex items-start space-x-4">
            <div className="bg-violet-600 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-violet-800 mb-3">
                Need Expert Guidance?
              </h3>
              <p className="text-violet-700 mb-6 text-lg">
                Our waste management specialists are ready to help you choose
                the perfect skip size for your specific project requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Call: 0800 123 4567
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-violet-600 text-violet-600 hover:bg-violet-50 px-8 py-3 rounded-full transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Get Quote via Email
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-grow">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-400"
                size={20}
              />
              <Input
                placeholder="Search by skip size or capacity..."
                className="pl-12 pr-4 py-3 bg-violet-50 border-violet-200 focus:border-violet-500 focus:ring-violet-500 rounded-xl text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[200px] bg-mint-50 border-mint-200 focus:border-violet-500 focus:ring-violet-500 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="size-asc">Size: Small to Large</SelectItem>
                  <SelectItem value="size-desc">
                    Size: Large to Small
                  </SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <Sheet
                open={mobileFiltersOpen}
                onOpenChange={setMobileFiltersOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden flex items-center gap-2 border-violet-600 text-violet-600 hover:bg-violet-50 rounded-xl"
                  >
                    <Filter size={18} />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="bg-gradient-to-b from-violet-50 to-mint-50"
                >
                  <div className="py-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-violet-800">
                        Filter Options
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileFiltersOpen(false)}
                        className="text-violet-600 hover:bg-violet-100 rounded-full"
                      >
                        <X size={20} />
                      </Button>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-4 text-violet-700">
                          Skip Categories
                        </h4>
                        <div className="space-y-3">
                          {[
                            { value: "all", label: "All Sizes" },
                            { value: "small", label: "Small (4-6 Yards)" },
                            { value: "medium", label: "Medium (8-12 Yards)" },
                            { value: "large", label: "Large (14+ Yards)" },
                          ].map((option) => (
                            <Button
                              key={option.value}
                              variant={
                                activeTab === option.value
                                  ? "default"
                                  : "outline"
                              }
                              className={`w-full justify-start rounded-xl ${
                                activeTab === option.value
                                  ? "bg-violet-600 hover:bg-violet-700 text-white"
                                  : "border-violet-300 text-violet-600 hover:bg-violet-50"
                              }`}
                              onClick={() => setActiveTab(option.value)}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Desktop Filter Tabs */}
        <div className="hidden lg:block mb-8">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-violet-100 p-1 rounded-xl">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-6 py-2"
              >
                All Sizes
              </TabsTrigger>
              <TabsTrigger
                value="small"
                className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-6 py-2"
              >
                Small (4-6 Yards)
              </TabsTrigger>
              <TabsTrigger
                value="medium"
                className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-6 py-2"
              >
                Medium (8-12 Yards)
              </TabsTrigger>
              <TabsTrigger
                value="large"
                className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg px-6 py-2"
              >
                Large (14+ Yards)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
            <p className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-3" />
              {error}
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg"
              >
                <div className="h-56 bg-violet-100">
                  <Skeleton className="h-full w-full bg-violet-200" />
                </div>
                <div className="p-6">
                  <Skeleton className="h-8 w-1/2 mb-4 bg-violet-200" />
                  <Skeleton className="h-4 w-1/3 mb-4 bg-violet-200" />
                  <Skeleton className="h-4 w-full mb-6 bg-violet-200" />
                  <div className="flex gap-2 mb-6">
                    <Skeleton className="h-6 w-20 bg-violet-200" />
                    <Skeleton className="h-6 w-24 bg-violet-200" />
                  </div>
                  <Skeleton className="h-14 w-full bg-violet-200" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Enhanced Skip Options Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedSkips.map((skip) => {
              const category = getSkipCategory(skip.size);
              const suitableUses = getSuitableUses(
                skip.size,
                skip.allows_heavy_waste
              );
              const description = getSkipDescription(
                skip.size,
                skip.allows_heavy_waste
              );
              const totalPrice = calculateTotalPrice(
                skip.price_before_vat,
                skip.vat
              );
              const skipImage = getSkipImage(skip.size);

              return (
                <Card
                  key={skip.id}
                  className="overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 rounded-2xl border border-gray-100 shadow-lg hover:-translate-y-2 group"
                >
                  <div className="relative">
                    <div className="h-56 bg-gradient-to-br from-violet-100 to-mint-100 relative overflow-hidden">
                      <img
                        src={skipImage || "/placeholder.svg"}
                        alt={`${skip.size} Yard Skip`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {skip.size} Yards
                      </div>
                      {!skip.allowed_on_road && (
                        <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-lg">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Road Restrictions
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-violet-800">
                        {skip.size} Yard Skip
                      </h3>
                      <div className="text-right">
                        <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          {totalPrice}
                        </span>
                        <p className="text-sm text-gray-500">inc. VAT</p>
                      </div>
                    </div>
                    <p className="text-violet-600 text-sm mb-4 font-medium">
                      {skip.hire_period_days} day hire period
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {description}
                    </p>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {suitableUses.map((item, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-mint-50 border-mint-300 text-mint-700 px-3 py-1 rounded-full"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 mb-6">
                      <div className="flex items-center text-sm">
                        {skip.allowed_on_road ? (
                          <CheckCircle2 className="h-5 w-5 text-mint-500 mr-3" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-3" />
                        )}
                        <span className="text-gray-700 font-medium">
                          {skip.allowed_on_road
                            ? "Road Placement Available"
                            : "Private Property Only"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        {skip.allows_heavy_waste ? (
                          <CheckCircle2 className="h-5 w-5 text-mint-500 mr-3" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-3" />
                        )}
                        <span className="text-gray-700 font-medium">
                          {skip.allows_heavy_waste
                            ? "Heavy Materials Accepted"
                            : "Light Materials Only"}
                        </span>
                      </div>
                    </div>

                    <Button
                      className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl font-semibold text-lg ${
                        selectedSkipId === skip.id
                          ? "bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white"
                          : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                      }`}
                      onClick={() => handleSkipSelection(skip)}
                    >
                      {selectedSkipId === skip.id ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Selected
                        </>
                      ) : (
                        <>
                          Select This Skip
                          <ChevronRight className="h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* No results */}
        {!isLoading && sortedSkips.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <Package className="mx-auto h-16 w-16 text-violet-300 mb-4" />
            <h3 className="text-2xl font-bold text-violet-800 mb-2">
              No skips found
            </h3>
            <p className="text-gray-600 text-lg">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <Dialog
        open={showConfirmationModal}
        onOpenChange={setShowConfirmationModal}
      >
        <DialogContent className="sm:max-w-sm bg-white rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto mb-4 bg-amber-100 p-3 rounded-full w-fit">
              <Info className="h-8 w-8 text-amber-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-violet-800 mb-2">
              Important Notice
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm leading-relaxed">
              Please note that the images shown are for illustration purposes
              only. The actual skip delivered may vary in exact shape, design,
              and color from what is displayed.
            </DialogDescription>
          </DialogHeader>

          {pendingSkipSelection && (
            <div className="bg-violet-50 rounded-xl p-4 my-4 border border-violet-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-violet-800">
                  {pendingSkipSelection.size} Yard Skip
                </h4>
                <span className="font-bold text-violet-600">
                  {calculateTotalPrice(
                    pendingSkipSelection.price_before_vat,
                    pendingSkipSelection.vat
                  )}
                </span>
              </div>
              <p className="text-sm text-violet-600">
                {pendingSkipSelection.hire_period_days} day hire period
              </p>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={cancelSkipSelection}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSkipSelection}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl py-3 font-semibold"
            >
              I Understand, Select Skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-violet-900 via-purple-900 to-violet-800 text-white mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-mint-400 p-2 rounded-full mr-3">
                  <Trash2 className="h-6 w-6 text-violet-800" />
                </div>
                <h3 className="text-2xl font-bold">We Want Waste</h3>
              </div>
              <p className="text-violet-200 text-lg leading-relaxed mb-6">
                Leading the way in sustainable waste management solutions for
                residential and commercial customers across the UK.
              </p>
              <div className="flex space-x-4">
                <div className="bg-violet-800 p-3 rounded-full">
                  <Star className="h-5 w-5 fill-current text-mint-400" />
                </div>
                <div className="bg-violet-800 p-3 rounded-full">
                  <Award className="h-5 w-5 fill-current text-mint-400" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-mint-300">Services</h4>
              <ul className="space-y-3 text-violet-200">
                <li>
                  <a href="#" className="hover:text-mint-300 transition-colors">
                    Skip Hire
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mint-300 transition-colors">
                    Commercial Waste
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mint-300 transition-colors">
                    Recycling Services
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-mint-300 transition-colors">
                    Waste Consultation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-mint-300">Contact</h4>
              <ul className="space-y-4 text-violet-200">
                <li className="flex items-center">
                  <div className="bg-violet-800 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-mint-400"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  0800 123 4567
                </li>
                <li className="flex items-center">
                  <div className="bg-violet-800 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-mint-400"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  hello@wewantwaste.co.uk
                </li>
                <li className="flex items-center">
                  <div className="bg-violet-800 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-mint-400"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  London, United Kingdom
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-violet-800 mt-12 pt-8 text-center">
            <p className="text-violet-300">
              © 2025 We Want Waste. All rights reserved. | Sustainable waste
              solutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
