import GradientButton from "@/components/ui/GradientButton";

const projects = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <form>
        <GradientButton
          color="blue"
          fromColor="purple-600"
          viaColor="pink-600"
          toColor="pink-600"
          type="submit"
        >
          Submit
        </GradientButton>
        <GradientButton
          color="white"
          fromColor="purple-600"
          viaColor="pink-600"
          toColor="pink-600"
          type="reset"
        >
          Reset
        </GradientButton>
        <GradientButton color="white" fromColor="purple-600" toColor="pink-600">
          Regular Button
        </GradientButton>
      </form>
    </div>
  );
};

export default projects;
