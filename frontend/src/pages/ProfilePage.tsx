import React, { useState, useEffect } from "react"
import {
  User,
  Shield,
  Heart,
  AlertTriangle,
  Lock,
  Save,
  Plus,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { userApi } from "../api/userApi"
import { useAuth } from "../context/AuthContext"
import MedicalNoticeBanner from "../components/common/MedicalNoticeBanner"
import { useToast } from "../components/common/Toast"

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const { success, error } = useToast()

  const [age, setAge] = useState<number | string>("")
  const [allergies, setAllergies] = useState<string[]>([])
  const [newAllergy, setNewAllergy] = useState("")
  const [conditions, setConditions] = useState<string[]>([])
  const [newCondition, setNewCondition] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (user?.profile) {
      if (user.profile.age !== undefined && user.profile.age !== null) {
        setAge(user.profile.age)
      }
      if (user.profile.allergies) {
        setAllergies(user.profile.allergies)
      }
      if (user.profile.existing_conditions) {
        setConditions(user.profile.existing_conditions)
      }
    }
  }, [user])

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy("")
    }
  }

  const handleRemoveAllergy = (item: string) => {
    setAllergies(allergies.filter((a) => a !== item))
  }

  const handleAddCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()])
      setNewCondition("")
    }
  }

  const handleRemoveCondition = (item: string) => {
    setConditions(conditions.filter((c) => c !== item))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSavingProfile(true)
      await userApi.updateProfile({
        age: age ? Number(age) : null,
        allergies,
        existing_conditions: conditions,
      })
      await refreshUser()
      success("Profile Saved", "Your health context has been updated.")
    } catch (err: any) {
      error("Save Error", err.message || "Failed to update profile.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      error("Password Mismatch", "New passwords do not match.")
      return
    }
    if (newPassword.length < 8) {
      error("Password Too Short", "New password must be at least 8 characters.")
      return
    }

    try {
      setIsChangingPassword(true)
      await userApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      success("Password Updated", "Your password has been changed successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      error("Change Failed", err.message || "Current password incorrect.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          User Account & Health Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Maintain clinical baseline characteristics (allergies, medical conditions) for future screening support.
        </p>
      </div>

      <MedicalNoticeBanner />

      {/* Account Info Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.name || "Clinician / Patient"}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Clinical Context Profile Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-teal-700" />
              Baseline Health Profile
            </h3>
            <p className="text-xs text-slate-500">
              Used strictly for cross-referencing contraindications. Handled with medical confidentiality.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Patient / User Age
            </label>
            <input
              type="number"
              min="0"
              max="130"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 45"
              className="w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Known Drug Allergies */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Known Drug Allergies (e.g. Penicillin, Sulfa drugs)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Enter allergy..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddAllergy()
                  }
                }}
                className="w-full sm:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-semibold hover:bg-teal-100 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {allergies.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-semibold"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(item)}
                    className="hover:text-rose-950 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {allergies.length === 0 && (
                <span className="text-slate-400 italic">No drug allergies recorded.</span>
              )}
            </div>
          </div>

          {/* Existing Medical Conditions */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Existing Chronic Conditions (e.g. Hypertension, Asthma, Type 2 Diabetes)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Enter condition..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCondition()
                  }
                }}
                className="w-full sm:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-semibold hover:bg-teal-100 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {conditions.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold"
                >
                  <Shield className="w-3 h-3 text-teal-600" />
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(item)}
                    className="hover:text-teal-950 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {conditions.length === 0 && (
                <span className="text-slate-400 italic">No existing conditions registered.</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSavingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Health Profile
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-100">
          <Lock className="w-4 h-4 text-slate-700" />
          Update Security Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-3 text-xs max-w-md">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              New Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition flex items-center gap-2"
          >
            {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
