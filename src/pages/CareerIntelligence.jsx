import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import careerIntelligenceService from "../services/careerIntelligence";
import CareerFamilyList from "../components/careerIntelligence/CareerFamilyList";
import FamilyCareersList from "../components/careerIntelligence/FamilyCareersList";
import CareerIntelligenceDetail from "../components/careerIntelligence/CareerIntelligenceDetail";
import IntelligenceLoadingSkeleton from "../components/careerIntelligence/IntelligenceLoadingSkeleton";
import IntelligenceEmptyState from "../components/careerIntelligence/IntelligenceEmptyState";

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
  // 3. Fetch Career Intelligence Detail
  // -------------------------------------------------------------------------
  const fetchCareerDetail = useCallback((slug) => {
    if (!slug) return;
    setDetailLoading(true);
    setDetailError(null);
    careerIntelligenceService
      .getCareerIntelligence(slug)
      .then((data) => {
        setCareerDetail(data);
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
      return <IntelligenceLoadingSkeleton type="detail" />;
    }
    if (detailError) {
      return (
        <IntelligenceEmptyState
          title="Career Intelligence Error"
          description={detailError}
          type="error"
          onRetry={() => fetchCareerDetail(careerSlug)}
          onBack={handleBackFromDetail}
          backLabel="Back"
        />
      );
    }
    return (
      <CareerIntelligenceDetail
        detailData={careerDetail}
        onBack={handleBackFromDetail}
        onNavigateFamily={handleSelectFamily}
      />
    );
  }

  // View 2: Family Careers
  if (familyKey) {
    if (familyLoading) {
      return <IntelligenceLoadingSkeleton type="careers" />;
    }
    if (familyError) {
      return (
        <IntelligenceEmptyState
          title="Family Error"
          description={familyError}
          type="error"
          onRetry={() => fetchFamilyCareers(familyKey)}
          onBack={handleBackToFamilies}
          backLabel="Back to All Families"
        />
      );
    }
    return (
      <FamilyCareersList
        familyData={familyData}
        onSelectCareer={handleSelectCareer}
        onBack={handleBackToFamilies}
      />
    );
  }

  // View 1: Families Catalog
  if (familiesLoading) {
    return <IntelligenceLoadingSkeleton type="families" />;
  }
  if (familiesError) {
    return (
      <IntelligenceEmptyState
        title="Failed to load Career Intelligence"
        description={familiesError}
        type="error"
        onRetry={fetchFamilies}
      />
    );
  }

  return (
    <CareerFamilyList
      families={families}
      onSelectFamily={handleSelectFamily}
    />
  );
}
