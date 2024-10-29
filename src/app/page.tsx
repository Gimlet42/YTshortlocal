"use client";

import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCreateVideo } from "./usecreatevideo";
import { useYourVideos } from "./useyourvideos";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Coins,
  Crown,
  Folder,
  Github,
  Loader2,
  Minus,
  Plus,
  Star,
  Wand,
  X,
  Zap,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import Credits from "./credits";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import ProButton from "./ProButton";
import NumberTicker from "@/components/magicui/number-ticker";
import { useGenerationType } from "./usegenerationtype";
import ClientTweetCard from "@/components/magicui/client-tweet-card";
import XIcon from "@/components/svg/XIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";

export default function Home({
  searchParams,
}: {
  searchParams: {
    error?: string;
    loggedIn?: string;
    subscribed?: string;
    // all for create video
    agent1Id?: string;
    agent2Id?: string;
    agent1Name?: string;
    agent2Name?: string;
    title?: string;
    credits?: string;
    music?: string;
    background?: string;
    assetType?: string;
    duration?: string;
    fps?: string;
  };
}) {
  const user = useUser();
  const router = useRouter();

  if (searchParams.subscribed === "true") {
    toast.success("🎉 welcome to the family");
    router.push("/");
  }
  if (searchParams.error === "true") {
    toast.error("Error. Please try again.");
    router.push("/");
  }

  const { setIsOpen: setIsGenerationTypeOpen, setVideoDetails } =
    useGenerationType();

  useEffect(() => {
    console.log(searchParams);

    if (
      searchParams.agent1Id &&
      searchParams.agent2Id &&
      searchParams.agent1Name &&
      searchParams.agent2Name &&
      searchParams.title &&
      searchParams.credits &&
      searchParams.fps
    ) {
      setVideoDetails({
        brainrot: {
          agents: [
            {
              id: parseInt(searchParams.agent1Id),
              name: searchParams.agent1Name as
                | "JORDAN_PETERSON"
                | "BEN_SHAPIRO"
                | "JOE_ROGAN"
                | "BARACK_OBAMA"
                | "DONALD_TRUMP"
                | "MARK_ZUCKERBERG"
                | "LIL_YACHTY"
                | "JOE_BIDEN",
            },
            {
              id: parseInt(searchParams.agent2Id),
              name: searchParams.agent2Name as
                | "JORDAN_PETERSON"
                | "BEN_SHAPIRO"
                | "JOE_ROGAN"
                | "BARACK_OBAMA"
                | "DONALD_TRUMP"
                | "MARK_ZUCKERBERG"
                | "LIL_YACHTY"
                | "JOE_BIDEN",
            },
          ],
          assetType: searchParams.assetType ?? "GOOGLE",
          background: searchParams?.background ?? "MINECRAFT",
          cost: parseInt(searchParams.credits),
          duration: searchParams?.duration
            ? parseInt(searchParams?.duration)
            : 1,
          fps: parseInt(searchParams.fps),
          music: searchParams.music ?? "NONE",
          title: searchParams.title,
          // not used in this case
          remainingCredits: 0,
        },
        math: {},
      });
      setIsGenerationTypeOpen(true);
    }
  }, [searchParams]);

  const userDB = trpc.user.user.useQuery().data;

  const [pendingVideo, setPendingVideo] = useState(false);
  const [placeInQueue, setPlaceInQueue] = useState(0);
  const [pendingVideoTitle, setPendingVideoTitle] = useState("");

  const videoStatus = trpc.user.videoStatus.useQuery();

  const { setIsOpen, isInQueue, setIsInQueue } = useCreateVideo();
  const { setIsOpen: setIsYourVideosOpen, setRefetchVideos } = useYourVideos();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Waiting in Queue");

  const deletePendingVideoMutation = trpc.user.deletePendingVideo.useMutation({
    onSuccess: () => {
      setProgress(0);
      setStatus("Waiting in Queue");
      setIsInQueue(false);
      setPendingVideo(false);
      setPendingVideoTitle("");
    },
  });

  const cancelPendingVideoMutation = trpc.user.cancelPendingVideo.useMutation({
    onSuccess: () => {
      toast.success("deleted video generation!");
      setProgress(0);
      setStatus("Waiting in Queue");
      setIsInQueue(false);
      setPendingVideo(false);
      setPendingVideoTitle("");
      window.location.reload();
    },
  });

  useEffect(() => {
    if (isInQueue) {
      const intervalId = setInterval(() => {
        videoStatus.refetch();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [videoStatus]);

  useEffect(() => {
    if (user.isSignedIn) {
      if (
        videoStatus.data?.videos !== null &&
        videoStatus.data?.videos !== undefined
      ) {
        setProgress(videoStatus.data.videos.progress);
        setStatus(videoStatus.data.videos.status);
        if (videoStatus.data.videos.status === "COMPLETED") {
          toast.success("Your video has been generated!", { icon: "🎉" });
          setRefetchVideos(true);
          deletePendingVideoMutation.mutate({ id: videoStatus.data.videos.id });
          setIsYourVideosOpen(true);
        } else if (videoStatus.data.videos.status === "ERROR") {
          toast.error(
            "Your video was not able to be generated. Please try again.",
            { icon: "💣" },
          );
          deletePendingVideoMutation.mutate({ id: videoStatus.data.videos.id });
        } else {
          setPendingVideoTitle(videoStatus.data.videos.title);
          setPendingVideo(true);
          setIsInQueue(true);
          setPlaceInQueue(videoStatus.data.queueLength);
        }
      }
    }
  }, [user.isSignedIn, videoStatus.data?.videos]);

  const { mutate: createStripeSession } =
    trpc.user.createCreditPackSession.useMutation({
      onSuccess: ({ url }) => {
        if (url) window.location.href = url;
      },
    });

  const [showCredits, setShowCredits] = useState(false);
  const [creditPacks, setCreditPacks] = useState(1);
  const cost = creditPacks * 5;
  const totalCredits = creditPacks * 25;

  useEffect(() => {
    if (isInQueue) {
      toast.info("Your video is currently in queue", { icon: "🕒" });
      setPendingVideo(true);
    }
  }, [isInQueue]);

  return (
    <>
      <main className="relative flex flex-col items-center justify-center gap-4">
        <div className="mt-[100px] flex w-[90%] flex-col items-center justify-center bg-opacity-60 pb-8 text-4xl lg:w-[80%] xl:w-[75%]">
          <div className="flex flex-col items-center justify-center gap-8 pb-8">
            {/* <div className="coarse:hidden">
            <FlyingGifs gifs={gifs} />
          </div> */}
            {/* <Link
              className="flex flex-col items-center gap-1"
              href="https://www.producthunt.com/products/brainrot-js"
              target="_blank"
            >
              <img
                className="h-[43px] w-[200]"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=455445&theme=light"
                alt="Brainrot&#0046;js - Rot&#0032;your&#0032;brain&#0032;one&#0032;AI&#0032;generated&#0032;video&#0032;at&#0032;a&#0032;time&#0046; | Product Hunt"
              />
            </Link> */}
            {/* <Link
              href={"https://github.com/noahgsolomon/brainrot.js"}
              target="_blank"
            >
              <AnimatedGradientText className="cursor-pointer">
                ⭐ <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" />{" "}
                <span
                  className={cn(
                    `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                  )}
                >
                  Star on GitHub
                </span>
              </AnimatedGradientText>
            </Link> */}

            <Image
              src={"https://images.smart.wtf/brainrot.png"}
              width={200}
              height={200}
              alt="brainrot"
              className="h-[200px] w-[200px] cursor-pointer rounded-full border-[10px] border-card shadow-lg transition-all hover:scale-[101%] active:scale-[99%] dark:border-primary coarse:h-[150px] coarse:w-[150px] coarse:border-[5px]"
            />

            <div className=" flex flex-col items-center gap-2">
              <div>
                <h1 className="relative max-w-[10ch] text-center text-5xl font-bold lg:text-6xl">
                  BRAINROT.JS
                </h1>
                <p className="flex w-full flex-row items-center justify-center gap-1 p-2 text-base font-normal italic">
                  <NumberTicker value={9221} /> videos generated 💀
                </p>
              </div>
              {/* Add the following block */}
            </div>
            {userDB?.user && !pendingVideo ? (
              <Card className="w-full max-w-xl border-none bg-transparent shadow-none">
                <CardContent>
                  <div className="grid gap-6 pt-4 sm:grid-cols-2">
                    {userDB?.user?.subscribed ? null : (
                      <div className="flex flex-col justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
                        <h3 className="text-lg font-semibold text-secondary-foreground">
                          Go Pro
                        </h3>
                        <div className="flex flex-col items-start gap-2">
                          <p className="text-sm text-secondary-foreground/80">
                            Generate 25 videos, 60 FPS, all agents, perfect
                            subtitles
                          </p>
                        </div>
                        <ProButton>
                          <Button
                            data-action="subscribe"
                            className="mt-2 flex w-full flex-row items-center justify-center gap-2"
                            size="lg"
                          >
                            GO PRO <Crown className="size-4" />
                          </Button>
                        </ProButton>
                      </div>
                    )}

                    <div className="flex flex-col justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
                      <h3 className="text-lg font-semibold text-secondary-foreground">
                        Buy Credits
                      </h3>
                      <div className="flex flex-col items-start gap-2">
                        <p className="text-sm text-secondary-foreground/80">
                          Purchase credits for individual videos
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="lg"
                            className="mt-2 flex w-full flex-row items-center justify-center gap-2"
                            variant="outline"
                          >
                            Buy Credits <Coins className="size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">
                              Purchase Credits
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-yellow-500" />
                                <p className="text-lg font-bold">
                                  {creditPacks * 25} credits
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={creditPacks <= 1}
                                  onClick={() =>
                                    setCreditPacks((prev) =>
                                      Math.max(1, prev - 1),
                                    )
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">
                                  {creditPacks}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={creditPacks >= 10}
                                  onClick={() =>
                                    setCreditPacks((prev) =>
                                      Math.min(10, prev + 1),
                                    )
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Each pack: 25 credits (~2-3 videos)
                            </p>
                            <div>
                              <p className="text-lg font-bold">
                                Total: ${creditPacks * 5}
                              </p>
                              <Button
                                variant="default"
                                onClick={() =>
                                  createStripeSession({ creditPacks })
                                }
                                className="mt-2 flex w-full flex-row items-center justify-center gap-2"
                              >
                                Purchase Credits <Zap className="h-4" />
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {pendingVideo && (
              <div className=" flex flex-col items-center gap-2 rounded-lg border border-border bg-card/80 p-4 text-sm shadow-sm">
                <div className="flex flex-row items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <div className="flex gap-2">
                    <span className="font-bold">Place in queue:</span>{" "}
                    {progress > 0 ? 0 : placeInQueue}
                  </div>
                </div>
                <div>
                  <span className="font-bold">Status:</span> {status}
                </div>
                <div>
                  <span className="font-bold">Est. time remaining: </span>{" "}
                  {(
                    (progress > 0 ? 0 : placeInQueue * 4) +
                    ((100 - progress) / 100) * 4
                  ).toFixed(2)}{" "}
                  mins
                </div>

                <div className="flex w-full flex-row items-center gap-2">
                  <p className="text-xs">{progress}%</p>
                  <Progress className="w-full" value={progress} />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="flex flex-row items-center gap-2"
              variant={"brain"}
              size={"lg"}
              disabled={pendingVideo}
              onClick={() => {
                setIsOpen(true);
              }}
            >
              <Wand className="h-4 w-4" /> Create Video
            </Button>
            {/* <Link
              href={"https://github.com/noahgsolomon/brainrot.js"}
              target="_blank"
              className={buttonVariants({
                className: "flex flex-row items-center gap-2",
                size: "lg",
                variant: "outline",
              })}
            >
              <Star className="h-4 w-4 " />
              Star on GitHub
            </Link> */}
            {/* <Link
              href={"/watch"}
              className={buttonVariants({
                variant: "outline",
                className: "relative flex flex-row items-center gap-2",
              })}
            >
              <Eye className="size-4" /> Watch
              <Badge
                className="absolute -right-3 -top-[0.4rem] px-[0.2rem] py-[0.1rem] text-xs opacity-90"
                variant={"red"}
              >
                NEW
              </Badge>
            </Link> */}

            {pendingVideo ? (
              <Button
                className="flex flex-row items-center gap-2 border border-red-500/60 bg-red-500/20 hover:bg-red-500/30"
                variant={"outline"}
                onClick={() => {
                  cancelPendingVideoMutation.mutate({
                    id: videoStatus.data?.videos?.id ?? 0,
                    credits: videoStatus.data?.videos?.credits ?? 0,
                  });
                }}
              >
                <X className="h-4 w-4 text-red-500" /> Cancel Generation
              </Button>
            ) : null}

            {user.isSignedIn ? (
              <>
                <Credits />
                <Button
                  variant={"outline"}
                  className="flex flex-row items-center gap-2 "
                  onClick={() => setIsYourVideosOpen(true)}
                >
                  <Folder className="h-4 w-4" />
                  Your videos
                </Button>
              </>
            ) : !user.isLoaded ? (
              <>
                <Skeleton className="h-[2.4rem] w-[11rem] rounded-lg"></Skeleton>
                <Skeleton className="h-[2.4rem] w-[11rem] rounded-lg"></Skeleton>
              </>
            ) : null}
          </div>
        </div>
        {/* <p className="max-w-[300px] pt-12 text-center italic">
          To anyone who supports us on{" "}
          <Link
            target="_blank"
            className="underline"
            href={"https://www.producthunt.com/products/brainrot-js"}
          >
            Product Hunt
          </Link>
          ... I will kiss u fr 😽
        </p> */}
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-xl font-bold">Recent Generations</p>
          <div className="flex max-w-[90%] flex-wrap items-center justify-center gap-4 ">
            <ClientTweetCard className="bg-card/80" id="1787633614835843302" />
            <ClientTweetCard className="bg-card/80" id="1787434978780819569" />
            <ClientTweetCard className="bg-card/80" id="1780386464091591078" />
          </div>
        </div>
      </main>
      {/* <footer className="flex w-screen justify-center border-t border-border bg-secondary px-4 py-4">
        <div className="flex w-full items-center justify-between px-[5%] py-1 md:px-[10%]">
          <Image
            src={"https://images.smart.wtf/brainrot.png"}
            width={64}
            height={64}
            alt="brainrot"
            className="cursor-pointer rounded-full border border-card shadow-lg transition-all hover:scale-[101%] active:scale-[99%] dark:border-primary"
          />
          <div className="flex flex-row items-center justify-center gap-2">
            <Link href={"https://github.com/noahgsolomon/brainrot.js"}>
              <Github className="size-6" />
            </Link>
            <Link href={"https://twitter.com/brainrotjs"}>
              <XIcon className="size-6 fill-primary" />
            </Link>
          </div>
        </div>
      </footer> */}
    </>
  );
}
