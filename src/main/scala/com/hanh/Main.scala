package com.hanh

import java.time.LocalTime

import scala.concurrent.duration._
import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{TextMessage, Message}
import akka.http.scaladsl.server.Directives._
import akka.stream.{OverflowStrategy, ActorMaterializer}
import akka.stream.scaladsl.{Source, Sink, Flow}
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import spray.json._

case class Tick()
case class Time(time: String)

object Marshallers extends DefaultJsonProtocol {
  implicit val timeMarshaller = jsonFormat1(Time)
}

object Main extends App {
  import Marshallers._
  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
  implicit val ec = system.dispatcher

  val in = Sink.ignore
  val out = Source.actorRef[Tick](1, OverflowStrategy.dropNew).mapMaterializedValue { a =>
    system.scheduler.schedule(1.second, 1.second, a, Tick())
  }.map(_ => {
    val time = Time(LocalTime.now.toString)
    TextMessage(time.toJson.compactPrint)
  })

  def clock: Flow[Message, Message, Unit] = Flow.fromSinkAndSource(in, out)

  val route = path("time") {
    handleWebsocketMessages(clock)
  }

  val bindingFuture = Http().bindAndHandle(route, "0.0.0.0", 3001)
}
