class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.state = {
            gold: 0,
            items: {}
        };
        this.engine.addChoice("Game Start.");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        let sceneType = locationData.Scene || "Location";
        if (sceneType !== "Location") {
            let SceneClass = getSceneClass(sceneType);
            this.engine.gotoScene(SceneClass, key);
            return;
        }

        if (locationData.Choices) {
            for (let choice of locationData.Choices) {
                if (choice.RequiresItem) {
                    if (this.engine.state.items && this.engine.state.items[choice.RequiresItem]) {
                        this.engine.addChoice(choice.Text, choice);
                    }
                } else {
                    this.engine.addChoice(choice.Text, choice);
                }
            }
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(choice) {
        if (choice) {
            this.engine.show("&gt; " + choice.Text);

            let targetKey = choice.Target;
            let targetData = this.engine.storyData.Locations[targetKey];
            let targetScene = targetData.Scene || "Location";
            let SceneClass = getSceneClass(targetScene);

            this.engine.gotoScene(SceneClass, targetKey);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

// 🦀 Custom Scene: Catch the Scuttle Crab
class CatchScuttleScene extends Scene {
    create(key) {
        console.log("⚠️ Entered CatchScuttleScene");

        if (!this.engine.state.gold) {
            this.engine.state.gold = 50;
            this.engine.show("You caught the Scuttle Crab! +50 gold!");
        } else {
            this.engine.show("The Scuttle Crab is gone.");
        }

        this.engine.addChoice("Back to river", "Bot River");
    }

    handleChoice(choice) {
        let target = choice.Target || choice;
        this.engine.gotoScene(Location, target);
    }
}

// 🛒 Custom Scene: Shop logic
class ShopScene extends Scene {
    create(key) {
        console.log("⚠️ Entered ShopScene");

        this.engine.show("Welcome to the Shop!");

        if (!this.engine.state.items) this.engine.state.items = {};
        if (!this.engine.state.gold) this.engine.state.gold = 0;

        if (!this.engine.state.items.LongSword && this.engine.state.gold >= 50) {
            this.engine.addChoice("Buy Long Sword (50g)", "buySword");
        } else if (this.engine.state.items.LongSword) {
            this.engine.show("You already own a Long Sword.");
        } else {
            this.engine.show("Not enough gold.");
        }

        this.engine.addChoice("Return to base", "Blue Base");
    }

    handleChoice(choice) {
        if (choice === "buySword") {
            this.engine.state.gold -= 50;
            this.engine.state.items.LongSword = true;
            this.engine.show("You purchased the Long Sword!");
            this.engine.gotoScene(Location, "Blue Base");
        } else {
            let target = choice.Target || choice;
            this.engine.gotoScene(Location, target);
        }
    }
}

// 🎣 Custom Scene: Fishing interaction
class FishingScene extends Scene {
    create(key) {
        console.log("🎣 Entered FishingScene");

        if (!this.engine.state.gold) this.engine.state.gold = 0;
        this.engine.state.gold += 1;

        this.engine.show("You patiently wait... and catch a coin fish! +1g");

        this.engine.addChoice("Keep fishing", "Fishing Spot");
        this.engine.addChoice("Return to river", "Top River");
    }

    handleChoice(choice) {
        let target = choice.Target || choice;
        this.engine.gotoScene(Location, target);
    }
}

// 🔄 Helper: Route custom scenes
function getSceneClass(sceneType) {
    switch (sceneType) {
        case "CatchScuttleScene":
            return CatchScuttleScene;
        case "ShopScene":
            return ShopScene;
        case "FishingScene":
            return FishingScene;
        case "Location":
        default:
            return Location;
    }
}

// 🚀 Load the engine with your JSON
Engine.load(Start, 'myStory.json');
