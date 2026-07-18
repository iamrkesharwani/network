import type { PostVisibility } from '@network/shared';
import TagInput from '../../upload/components/TagInput';
import VisibilitySelector from '../../upload/components/VisibilitySelector';

interface PostStepTwoProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  visibility: PostVisibility;
  setVisibility: (visibility: PostVisibility) => void;
  onBack: () => void;
  onReview: () => void;
}

const PostStepTwo = ({
  tags,
  setTags,
  visibility,
  setVisibility,
  onBack,
  onReview,
}: PostStepTwoProps) => (
  <div>
    <TagInput value={tags} onChange={setTags} />

    <VisibilitySelector value={visibility} onChange={setVisibility} />

    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-text-secondary hover:border-primary/40 transition-colors cursor-pointer"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onReview}
        className="flex-2 rounded-lg border border-primary py-3 text-sm font-semibold text-primary cursor-pointer"
      >
        Review
      </button>
    </div>
  </div>
);

export default PostStepTwo;
