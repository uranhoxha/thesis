type RecipePaperProps = {
  color: string;
  title: string;
  ingredients: readonly string[];
  method: string;
  meta: string;
};

function RecipePaper({
  color,
  title,
  ingredients,
  method,
  meta,
}: RecipePaperProps) {
  const tint = `${color}3d`;

  return (
    <div className="w-full h-full flex items-center justify-center select-none">
      <div
        className="@container h-full aspect-[435/534] rounded-xs bg-white flex flex-col p-[5cqw]"
        style={{ border: `2px solid ${tint}` }}
      >
        <div
          className="self-start max-w-[70%] px-[3.5cqw] py-[2cqw] rounded-[5px]"
          style={{ backgroundColor: tint }}
        >
          <span
            className="font-serif italic leading-none block"
            style={{ color, fontSize: "clamp(12px, 5.6cqw, 32px)" }}
          >
            {title}
          </span>
        </div>

        <div className="mt-[6cqw]">
          <div
            className="uppercase font-semibold"
            style={{
              color,
              fontSize: "clamp(7px, 2.4cqw, 12px)",
              letterSpacing: "0.2em",
            }}
          >
            Ingredients
          </div>
          <ul className="mt-[3cqw] space-y-[2.4cqw]">
            {ingredients.map((it, i) => (
              <li
                key={i}
                className="border-b border-zinc-200 pb-[1.2cqw] text-zinc-700"
                style={{ fontSize: "clamp(9px, 2.9cqw, 15px)" }}
              >
                {it}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-[5cqw]">
          <div
            className="uppercase font-semibold"
            style={{
              color,
              fontSize: "clamp(7px, 2.4cqw, 12px)",
              letterSpacing: "0.2em",
            }}
          >
            Method
          </div>
          <p
            className="mt-[2.4cqw] text-zinc-600 leading-relaxed"
            style={{ fontSize: "clamp(9px, 2.7cqw, 14px)" }}
          >
            {method}
          </p>
        </div>

        <div
          className="mt-auto pt-[3cqw] uppercase"
          style={{
            color: `${color}99`,
            fontSize: "clamp(7px, 2.2cqw, 11px)",
            letterSpacing: "0.22em",
          }}
        >
          {meta}
        </div>
      </div>
    </div>
  );
}

const GREEN = "#25671E";
const RED = "#D92C54";
const BLUE = "#36656B";
const YELLOW = "#FF9B2F";

const recipes = {
  lemonRicotta: {
    color: YELLOW,
    title: "Lemon Ricotta",
    ingredients: [
      "1 cup ricotta",
      "2 eggs, separated",
      "1 lemon, zested",
      "¾ cup flour",
    ],
    method:
      "Whisk yolks into ricotta with zest. Fold in whipped whites and flour. Griddle in butter until golden.",
    meta: "serves 2 · 20 min",
  },
  saffronRisotto: {
    color: YELLOW,
    title: "Saffron Risotto",
    ingredients: [
      "1½ cups arborio",
      "pinch of saffron",
      "4 cups stock, warm",
      "parmesan, butter",
    ],
    method:
      "Toast rice in butter. Ladle stock slowly, stirring. Finish off-heat with cheese and a knob of butter.",
    meta: "serves 4 · 35 min",
  },
  strawberryGalette: {
    color: RED,
    title: "Strawberry Galette",
    ingredients: [
      "2 cups strawberries",
      "1 disc cold dough",
      "¼ cup sugar",
      "1 lemon, zested",
    ],
    method:
      "Pile fruit on rolled dough. Fold edges over. Brush with egg, sprinkle sugar, bake at 400°F until deep gold.",
    meta: "serves 6 · 45 min",
  },
  tomatoConfit: {
    color: RED,
    title: "Tomato Confit",
    ingredients: [
      "1 pint cherry tomatoes",
      "½ cup good olive oil",
      "4 garlic cloves",
      "thyme, flaky salt",
    ],
    method:
      "Combine in a small dish, tomatoes mostly submerged. Roast at 250°F for 90 min until collapsed and the oil is red.",
    meta: "serves 2 · 90 min",
  },
  pestoOrecchiette: {
    color: GREEN,
    title: "Pesto Orecchiette",
    ingredients: [
      "1 bunch basil",
      "¼ cup pine nuts",
      "1 garlic clove",
      "parmesan, olive oil",
    ],
    method:
      "Pound basil with salt to a paste. Add nuts, garlic, then cheese and oil. Toss with hot pasta and a splash of water.",
    meta: "serves 4 · 15 min",
  },
  herbButterBeans: {
    color: GREEN,
    title: "Herb Butter Beans",
    ingredients: [
      "2 cups gigante beans",
      "3 tbsp butter",
      "small bunch parsley",
      "½ lemon, juiced",
    ],
    method:
      "Warm beans gently in butter and herbs until glossy. Finish with lemon and a slick of olive oil. Eat with bread.",
    meta: "serves 4 · 20 min",
  },
  blueberryScones: {
    color: BLUE,
    title: "Blueberry Scones",
    ingredients: [
      "2 cups flour",
      "1 stick cold butter",
      "1 cup blueberries",
      "½ cup cream",
    ],
    method:
      "Cut butter into flour until pebbled. Fold in berries and cream just until shaggy. Pat, cut wedges, bake hot.",
    meta: "serves 8 · 30 min",
  },
  steamedMussels: {
    color: BLUE,
    title: "Steamed Mussels",
    ingredients: [
      "2 lb mussels, scrubbed",
      "1 cup white wine",
      "1 shallot, sliced",
      "parsley, butter",
    ],
    method:
      "Sweat shallot in butter, add wine and mussels. Cover and steam until shells open. Shower with parsley.",
    meta: "serves 2 · 12 min",
  },
} as const;

const paperWrapper =
  "absolute cursor-pointer will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 hover:z-10";

export default function AuthBg() {
  return (
    <>
      <div className={`${paperWrapper} -top-20 -left-20 w-[512px] h-[512px] rotate-12 hover:rotate-0`}>
        <RecipePaper {...recipes.lemonRicotta} />
      </div>
      <div className={`${paperWrapper} -bottom-10 -right-20 w-[576px] h-[576px] -rotate-6 hover:rotate-0`}>
        <RecipePaper {...recipes.saffronRisotto} />
      </div>

      <div className={`${paperWrapper} -top-40 -right-30 w-[640px] h-[640px] -rotate-45 hover:rotate-0`}>
        <RecipePaper {...recipes.strawberryGalette} />
      </div>
      <div className={`${paperWrapper} -bottom-40 left-[20%] w-[448px] h-[448px] -rotate-60 hover:-rotate-50`}>
        <RecipePaper {...recipes.tomatoConfit} />
      </div>

      <div className={`${paperWrapper} top-1/2 -left-24 w-[512px] h-[512px] rotate-20 hover:rotate-0`}>
        <RecipePaper {...recipes.pestoOrecchiette} />
      </div>
      <div className={`${paperWrapper} -bottom-70 right-30 w-[640px] h-[640px] rotate-30 hover:rotate-0`}>
        <RecipePaper {...recipes.herbButterBeans} />
      </div>

      <div className={`${paperWrapper} -bottom-70 -right-40 w-[576px] h-[576px] rotate-12 hover:rotate-0`}>
        <RecipePaper {...recipes.blueberryScones} />
      </div>
      <div className={`${paperWrapper} bottom-1/4 -left-40 w-[512px] h-[512px] -rotate-3 hover:rotate-0`}>
        <RecipePaper {...recipes.steamedMussels} />
      </div>
    </>
  );
}
