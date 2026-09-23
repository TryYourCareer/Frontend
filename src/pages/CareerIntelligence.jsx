import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import careerIntelligenceService from "../services/careerIntelligence";
import trialMissionService from "../services/trialMission";
import CareerFamilyList from "../components/careerIntelligence/CareerFamilyList";
import FamilyCareersList from "../components/careerIntelligence/FamilyCareersList";
import CareerIntelligenceDetail from "../components/careerIntelligence/CareerIntelligenceDetail";
import IntelligenceLoadingSkeleton from "../components/careerIntelligence/IntelligenceLoadingSkeleton";
import IntelligenceEmptyState from "../components/careerIntelligence/IntelligenceEmptyState";
import SEO from "../components/SEO";

export default function CareerIntelligence() {
  const { familyKey, careerSlug } = useParams();
  const navigate = useNavigate();

  // State for 1. Families Catalog
  const [families, setFamilies] = useState([]);
  const [familiesLoading, setFamiliesLoading] = useState(false);
  const [familiesError, setFamiliesError] = useState(null);

  // State for 2. Family Careers
  const [familyData, setFamilyData] = useState(null);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState(null);

  // State for 3. Career Detail
  const [careerDetail, setCareerDetail] = useState(null);
  const [publishedMission, setPublishedMission] = useState(null);
  const [missionLookupError, setMissionLookupError] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // -------------------------------------------------------------------------
  // 1. Fetch Families (Catalog view)
  // -------------------------------------------------------------------------
  const fetchFamilies = useCallback(() => {
    setFamiliesLoading(true);
    setFamiliesError(null);
    careerIntelligenceService
      .listCareerFamilies()
      .then((data) => {
        setFamilies(data || []);
      })
      .catch((err) => {
        setFamiliesError(err.message || "Failed to load career families.");
      })
      .finally(() => {
        setFamiliesLoading(false);
      });
  }, []);

  // -------------------------------------------------------------------------
  // 2. Fetch Family Careers
  // -------------------------------------------------------------------------
  const fetchFamilyCareers = useCallback((key) => {
    if (!key) return;
    setFamilyLoading(true);
    setFamilyError(null);
    careerIntelligenceService
      .getFamilyCareers(key)
      .then((data) => {
        setFamilyData(data);
      })
      .catch((err) => {
        setFamilyError(err.message || `Failed to load careers for family '${key}'.`);
      })
      .finally(() => {
        setFamilyLoading(false);
      });
  }, []);

  // -------------------------------------------------------------------------
  // 3. Fetch Career Intelligence Detail & Published Mission
  // -------------------------------------------------------------------------
  const fetchCareerDetail = useCallback((slug) => {
    if (!slug) return;
    setDetailLoading(true);
    setDetailError(null);
    setPublishedMission(null);
    setMissionLookupError(false);

    Promise.allSettled([
      careerIntelligenceService.getCareerIntelligence(slug),
      trialMissionService.getTrialMissions(),
    ])
      .then(([detailResult, missionsResult]) => {
        if (detailResult.status === "fulfilled") {
          const detail = detailResult.value;
          setCareerDetail(detail);

          if (missionsResult.status === "fulfilled" && Array.isArray(missionsResult.value)) {
            setMissionLookupError(false);
            const missions = missionsResult.value;
            const career = detail?.career;
            const matched = missions.find(
              (m) =>
                (career?.id && m.career_id === career.id) ||
                (career?.slug && m.career?.slug === career.slug)
            );
            setPublishedMission(matched || null);
          } else {
            setMissionLookupError(true);
            setPublishedMission(null);
          }
        } else {
          setDetailError(
            detailResult.reason?.message || `Failed to load career intelligence for '${slug}'.`
          );
        }
      })
      .catch((err) => {
        setDetailError(err.message || `Failed to load career intelligence for '${slug}'.`);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  }, []);

  // -------------------------------------------------------------------------
  // Route Dispatcher
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (careerSlug) {
      fetchCareerDetail(careerSlug);
    } else if (familyKey) {
      fetchFamilyCareers(familyKey);
    } else {
      fetchFamilies();
    }
  }, [careerSlug, familyKey, fetchFamilies, fetchFamilyCareers, fetchCareerDetail]);

  // -------------------------------------------------------------------------
  // Navigation Handlers
  // -------------------------------------------------------------------------
  const handleSelectFamily = (key) => {
    navigate(`/career-intelligence/family/${encodeURIComponent(key)}`);
  };

  const handleSelectCareer = (slug) => {
    navigate(`/career-intelligence/career/${encodeURIComponent(slug)}`);
  };

  const handleBackToFamilies = () => {
    navigate("/career-intelligence");
  };

  const handleBackFromDetail = () => {
    if (careerDetail?.classification?.family_key) {
      navigate(`/career-intelligence/family/${encodeURIComponent(careerDetail.classification.family_key)}`);
    } else {
      navigate("/career-intelligence");
    }
  };

  // -------------------------------------------------------------------------
  // Render View Modes
  // -------------------------------------------------------------------------

  // View 3: Career Detail
  if (careerSlug) {
    if (detailLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8">
          <IntelligenceLoadingSkeleton type="detail" />
        </div>
      );
    }
    if (detailError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 flex items-center justify-center">
          <IntelligenceEmptyState
            title="Career Intelligence Error"
            description={detailError}
            type="error"
            onRetry={() => fetchCareerDetail(careerSlug)}
            onBack={handleBackFromDetail}
            backLabel="Back"
          />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 sm:px-6 lg:px-10">
        <SEO
          title={careerDetail?.career?.name ? `${careerDetail.career.name} — Career Intelligence` : "Career Intelligence Detail"}
          description={careerDetail?.career?.description || "In-depth intelligence, competencies, industry metrics, and simulator missions for this career."}
          url={`/career-intelligence/career/${careerSlug}`}
        />
        <div className="mx-auto max-w-6xl">
          <CareerIntelligenceDetail
            detailData={careerDetail}
            publishedMission={publishedMission}
            missionLookupError={missionLookupError}
            onBack={handleBackFromDetail}
            onNavigateFamily={handleSelectFamily}
          />
        </div>
      </div>
    );
  }

  // View 2: Family Careers
  if (familyKey) {
    if (familyLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8">
          <IntelligenceLoadingSkeleton type="careers" />
        </div>
      );
    }
    if (familyError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 flex items-center justify-center">
          <IntelligenceEmptyState
            title="Family Error"
            description={familyError}
            type="error"
            onRetry={() => fetchFamilyCareers(familyKey)}
            onBack={handleBackToFamilies}
            backLabel="Back to All Families"
          />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 sm:px-6 lg:px-10">
        <SEO
          title={familyData?.family_name ? `${familyData.family_name} Careers — Career Intelligence` : "Career Family Intelligence"}
          description={familyData?.tagline || "Explore career options, salary potential, and trial missions within this industry cluster."}
          url={`/career-intelligence/family/${familyKey}`}
        />
        <div className="mx-auto max-w-6xl">
          <FamilyCareersList
            familyData={familyData}
            onSelectCareer={handleSelectCareer}
            onBack={handleBackToFamilies}
          />
        </div>
      </div>
    );
  }

  // View 1: Families Catalog
  if (familiesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8">
        <IntelligenceLoadingSkeleton type="families" />
      </div>
    );
  }
  if (familiesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 flex items-center justify-center">
        <IntelligenceEmptyState
          title="Failed to load Career Intelligence"
          description={familiesError}
          type="error"
          onRetry={fetchFamilies}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 sm:px-6 lg:px-10">
      <SEO
        title="Career Intelligence & Industry Clusters"
        description="Comprehensive career intelligence library, taxonomy clusters, demand insights, and interactive real-world work simulators."
        url="/career-intelligence"
      />
      <div className="mx-auto max-w-6xl">
        <CareerFamilyList
          families={families}
          onSelectFamily={handleSelectFamily}
        />
      </div>
    </div>
  );
}